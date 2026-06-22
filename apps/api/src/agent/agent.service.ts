import { Injectable } from '@nestjs/common';
import { DeepseekService } from '../deepseek/deepseek.service';
import { StatsService } from '../stats/stats.service';
import { ConfigService } from '../config/config.service';

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
  ) {}

  async *run(
    chatId: string,
    projectId: string,
    prompt: string,
  ): AsyncGenerator<AgentEvent> {
    const { model } = this.config.getConfig();

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

    for await (const chunk of this.deepseek.streamChat(prompt, model)) {
      if (chunk.usage) {
        usage = chunk.usage;
      }
      if (chunk.chunk) {
        fullResponseParts.push(chunk.chunk);
        yield this.emit('agent:delta', { chatId, content: chunk.chunk });
      }
    }

    yield this.emit('agent:status', {
      chatId,
      status: 'editing',
    });
    await this.delay(300);

    yield this.emit('agent:fileChange', {
      chatId,
      file: 'src/pages/index.tsx',
      original: `function Home() {\n  return <h1>Hello</h1>;\n}`,
      modified: `export default function Home() {\n  return <h1>Hello TurtleCode</h1>;\n}`,
    });

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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
