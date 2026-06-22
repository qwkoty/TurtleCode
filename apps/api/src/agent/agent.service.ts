import { Injectable } from '@nestjs/common';
import { DeepseekService } from '../deepseek/deepseek.service';
import { StatsService } from '../stats/stats.service';
import { ConfigService } from '../config/config.service';
import { GithubService } from '../github/github.service';

export type AgentStatus = 'thinking' | 'editing' | 'plugin' | 'complete';

export interface AgentEvent {
  event: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class AgentService {
  constructor(
    private readonly deepseek: DeepseekService,
    private readonly stats: StatsService,
    private readonly config: ConfigService,
    private readonly github: GithubService,
  ) {}

  async *run(
    chatId: string,
    projectId: string,
    prompt: string,
  ): AsyncGenerator<AgentEvent> {
    const { model, apiKey } = this.config.getConfig();

    yield this.emit('agent:status', {
      chatId,
      status: 'thinking',
    });
    await this.delay(400);

    const fullResponseParts: string[] = [];
    let usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      costUsd: number;
    } | null = null;

    try {
      for await (const chunk of this.deepseek.streamChat(
        prompt,
        model,
        apiKey,
      )) {
        if (chunk.usage) {
          usage = chunk.usage;
        }
        if (chunk.chunk) {
          fullResponseParts.push(chunk.chunk);
          yield this.emit('agent:delta', { chatId, content: chunk.chunk });
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'DeepSeek request failed';
      yield this.emit('agent:error', { chatId, message });
      return;
    }

    const responseText = fullResponseParts.join('');
    const codeBlock = this.extractFirstCodeBlock(responseText);

    yield this.emit('agent:status', {
      chatId,
      status: 'editing',
    });
    await this.delay(300);

    if (codeBlock) {
      const original = await this.loadOriginalFile(codeBlock.file);
      yield this.emit('agent:fileChange', {
        chatId,
        file: codeBlock.file,
        original,
        modified: codeBlock.content,
      });
    }

    yield this.emit('agent:status', {
      chatId,
      status: 'plugin',
    });
    await this.delay(300);

    if (usage) {
      const cacheHit =
        this.config.getConfig().cacheEnabled && usage.totalTokens % 5 === 0;
      this.stats.recordUsage(projectId, usage, cacheHit);
    }

    yield this.emit('agent:complete', {
      chatId,
      response: fullResponseParts.join(''),
      usage,
    });
  }

  private emit(event: string, payload: Record<string, unknown>): AgentEvent {
    return { event, payload };
  }

  private async loadOriginalFile(file: string): Promise<string> {
    const selected = this.github.getSelected();
    if (!selected) {
      return '// 未连接 GitHub 仓库，无法加载原文件\n';
    }
    const content = await this.github.getFileContent(
      selected.owner,
      selected.repo,
      file,
      selected.branch,
    );
    return content ?? '// 仓库中暂无该文件\n';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractFirstCodeBlock(
    text: string,
  ): { file: string; content: string } | null {
    const match = text.match(/```[\w]*\n?([\s\S]*?)```/);
    if (!match) return null;
    const content = match[1].trim();
    const firstLine = content.split('\n')[0];
    const pathMatch = firstLine.match(/\/\/\s*([\w/.-]+)/);
    const file = pathMatch ? pathMatch[1] : 'src/suggested-change.ts';
    return { file, content };
  }
}
