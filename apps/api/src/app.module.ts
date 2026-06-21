import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from './config/config.module';
import { ChatModule } from './chat/chat.module';
import { AgentModule } from './agent/agent.module';
import { SkillsModule } from './skills/skills.module';
import { GithubModule } from './github/github.module';
import { StatsModule } from './stats/stats.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../apps/web/dist'),
      exclude: ['/api*', '/socket.io*'],
    }),
    ConfigModule,
    ChatModule,
    AgentModule,
    SkillsModule,
    GithubModule,
    StatsModule,
    EventsModule,
  ],
})
export class AppModule {}
