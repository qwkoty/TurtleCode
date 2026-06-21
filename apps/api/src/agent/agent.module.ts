import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { DeepseekModule } from '../deepseek/deepseek.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [DeepseekModule, StatsModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
