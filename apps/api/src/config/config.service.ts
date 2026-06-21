import { Injectable } from '@nestjs/common';

export interface AppConfig {
  model: 'deepseek-v4-flash' | 'deepseek-v4-pro';
  apiKey: string;
  cacheEnabled: boolean;
}

@Injectable()
export class ConfigService {
  private config: AppConfig = {
    model: 'deepseek-v4-flash',
    apiKey: '',
    cacheEnabled: true,
  };

  getConfig(): AppConfig {
    return { ...this.config };
  }

  setConfig(partial: Partial<AppConfig>): AppConfig {
    this.config = { ...this.config, ...partial };
    return this.getConfig();
  }

  testApiKey(): { valid: boolean; message: string } {
    const key = this.config.apiKey.trim();
    if (!key) {
      return { valid: false, message: 'API key is empty' };
    }
    if (key.length < 8) {
      return { valid: false, message: 'API key is too short' };
    }
    return { valid: true, message: 'Mock API key validation passed' };
  }
}
