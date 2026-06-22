import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type Model = 'deepseek-v4-flash' | 'deepseek-v4-pro';

export interface AppConfig {
  model: Model;
  apiKey: string;
  cacheEnabled: boolean;
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private config: AppConfig = {
    model: (process.env.DEFAULT_MODEL as Model) || 'deepseek-v4-flash',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    cacheEnabled: true,
  };

  getConfig(): AppConfig {
    return { ...this.config };
  }

  setConfig(partial: Partial<AppConfig>): AppConfig {
    this.config = { ...this.config, ...partial };
    return this.getConfig();
  }

  async testApiKey(draftKey?: string): Promise<{
    valid: boolean;
    message: string;
  }> {
    const key = (draftKey ?? this.config.apiKey).trim();
    if (!key) {
      return { valid: false, message: 'API key is empty' };
    }
    if (!key.startsWith('sk-')) {
      return { valid: false, message: 'Invalid DeepSeek key format' };
    }

    try {
      const res = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-v4-flash',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );
      if (res.status === 200) {
        return { valid: true, message: 'DeepSeek API 连接成功' };
      }
      return { valid: false, message: `Unexpected status ${res.status}` };
    } catch (error) {
      this.logger.error('DeepSeek API test failed', error);
      const message =
        axios.isAxiosError(error) && error.response
          ? `DeepSeek error: ${error.response.status} ${JSON.stringify(error.response.data)}`
          : 'Connection failed';
      return { valid: false, message };
    }
  }
}
