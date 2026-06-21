import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';
import type { ProjectStats } from './stats.service';

@Controller('projects')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get(':id/stats')
  getStats(@Param('id') id: string): ProjectStats {
    return this.statsService.getStats(id);
  }
}
