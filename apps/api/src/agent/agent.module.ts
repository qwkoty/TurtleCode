import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { DeepseekModule } from '../deepseek/deepseek.module';
import { StatsModule } from '../stats/stats.module';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [DeepseekModule, StatsModule, GithubModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
