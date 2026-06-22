import { Injectable, Logger } from '@nestjs/common';
import type { Model } from '../config/config.service';

export interface ChatChunk {
  chunk: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

interface DeepSeekStreamChoice {
  delta: { content?: string; role?: string };
  index: number;
  finish_reason: string | null;
}

interface DeepSeekStreamChunk {
  id: string;
  choices: DeepSeekStreamChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class DeepseekService {
  private readonly logger = new Logger(DeepseekService.name);

  async *streamChat(
    prompt: string,
    model: Model,
    apiKey: string,
  ): AsyncGenerator<ChatChunk> {
    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are TurtleCode, an AI coding agent. Help the user with coding tasks. When you provide code changes, wrap them in a markdown code block and put the target file path as the first line comment, e.g. // src/utils/example.ts.',
          },
          { role: 'user', content: prompt },
        ],
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      throw new Error(`DeepSeek API error ${response.status}: ${text}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('DeepSeek response has no body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data:')) continue;

          try {
            const json: DeepSeekStreamChunk = JSON.parse(trimmed.slice(5).trim());

            if (json.usage) {
              promptTokens = json.usage.prompt_tokens;
              completionTokens = json.usage.completion_tokens;
              totalTokens = json.usage.total_tokens;
            }

            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              yield { chunk: delta };
            }
          } catch {
            // ignore malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (totalTokens === 0) {
      const estimated = this.calculateUsage(prompt, fullText, model);
      promptTokens = estimated.promptTokens;
      completionTokens = estimated.completionTokens;
      totalTokens = estimated.totalTokens;
    }

    const costUsd = this.calculateCost(totalTokens, model);
    yield {
      chunk: '',
      usage: { promptTokens, completionTokens, totalTokens, costUsd },
    };
  }

  calculateUsage(
    prompt: string,
    completion: string,
    model: Model,
  ): { promptTokens: number; completionTokens: number; totalTokens: number; costUsd: number } {
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(completion.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const costUsd = this.calculateCost(totalTokens, model);
    return { promptTokens, completionTokens, totalTokens, costUsd };
  }

  calculateCost(totalTokens: number, model: Model): number {
    // DeepSeek V4 official pricing (input + output averaged per token)
    // deepseek-v4-flash: ~$0.0001 / 1K tokens
    // deepseek-v4-pro: ~$0.0015 / 1K tokens
    const rate = model === 'deepseek-v4-pro' ? 0.0000015 : 0.0000001;
    return Number((totalTokens * rate).toFixed(6));
  }
}
