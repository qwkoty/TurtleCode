import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatModule } from '../chat/chat.module';
import { AgentModule } from '../agent/agent.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [ChatModule, AgentModule, StatsModule],
  providers: [EventsGateway],
})
export class EventsModule {}
