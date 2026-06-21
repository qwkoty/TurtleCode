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
    return this.configService.setConfig(body);
  }

  @Post('test')
  testApiKey(): { valid: boolean; message: string } {
    return this.configService.testApiKey();
  }
}
