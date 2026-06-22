import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from './config.service';
import type { AppConfig } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getConfig(): AppConfig {
    return this.configService.getConfig();
  }

  @Post()
  updateConfig(@Body() body: Partial<AppConfig>): AppConfig {
    // 不要把 apiKey 回显给前端
    const update: Partial<AppConfig> = {};
    if (body.model) update.model = body.model;
    if (body.cacheEnabled !== undefined)
      update.cacheEnabled = body.cacheEnabled;
    if (body.apiKey !== undefined) update.apiKey = body.apiKey;
    return this.configService.setConfig(update);
  }

  @Post('test')
  async testApiKey(
    @Body() body: { apiKey?: string },
  ): Promise<{ valid: boolean; message: string }> {
    return this.configService.testApiKey(body?.apiKey);
  }
}
