import { Injectable } from '@nestjs/common';

export interface ChatChunk {
  chunk: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

const MOCK_RESPONSES: Record<string, string> = {
  default:
    "I'll help you with that. Let me analyze the codebase and make the necessary changes. First, I'll look at the current structure, then propose an edit, and finally verify it works.",
};

@Injectable()
export class DeepseekService {
  async *streamChat(
    prompt: string,
    model: 'deepseek-v4-flash' | 'deepseek-v4-pro',
  ): AsyncGenerator<ChatChunk> {
    const text = MOCK_RESPONSES.default;
    const words = text.split(' ');
    const chunkSize = 3;

    for (let i = 0; i < words.length; i += chunkSize) {
      const slice = words.slice(i, i + chunkSize);
      yield { chunk: slice.join(' ') + ' ' };
      await this.delay(80);
    }

    const usage = this.calculateUsage(prompt, text, model);
    yield { chunk: '', usage };
  }

  calculateUsage(
    prompt: string,
    completion: string,
    model: 'deepseek-v4-flash' | 'deepseek-v4-pro',
  ): ChatChunk['usage'] {
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(completion.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const rate = model === 'deepseek-v4-pro' ? 0.000003 : 0.0000005;
    const costUsd = Number((totalTokens * rate).toFixed(6));
    return { promptTokens, completionTokens, totalTokens, costUsd };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
