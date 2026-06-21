import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { AgentService } from '../agent/agent.service';
import { StatsService } from '../stats/stats.service';

interface ChatSendPayload {
  chatId?: string;
  projectId?: string;
  content?: string;
}

@WebSocketGateway({
  path: '/',
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private statsInterval?: NodeJS.Timeout;

  constructor(
    private readonly chatService: ChatService,
    private readonly agentService: AgentService,
    private readonly statsService: StatsService,
  ) {}

  afterInit(): void {
    this.logger.log('WebSocket gateway initialized');
    this.statsInterval = setInterval(() => {
      const stats = this.statsService.getStats('default-project');
      this.server.emit('stats:update', stats);
    }, 10000);
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat:send')
  async handleChatSend(
    @MessageBody() payload: ChatSendPayload,
    client: Socket,
  ): Promise<void> {
    const content = payload.content?.trim() ?? '';
    if (!content) {
      client.emit('chat:error', { message: 'Content is required' });
      return;
    }

    let chatId = payload.chatId;
    if (!chatId || !this.chatExists(chatId)) {
      const chat = this.chatService.create();
      chatId = chat.id;
      client.emit('chat:created', chat);
    }

    const projectId = payload.projectId ?? 'default-project';
    this.chatService.addMessage(chatId, 'user', content);
    client.emit('chat:message', { chatId, role: 'user', content });

    try {
      const assistantParts: string[] = [];
      for await (const event of this.agentService.run(
        chatId,
        projectId,
        content,
      )) {
        client.emit(event.event, event.payload);
        if (
          event.event === 'agent:delta' &&
          typeof event.payload.content === 'string'
        ) {
          assistantParts.push(event.payload.content);
        }
      }

      const response = assistantParts.join('').trim();
      if (response) {
        this.chatService.addMessage(chatId, 'assistant', response);
      }
    } catch (error) {
      this.logger.error(error);
      client.emit('agent:error', { chatId, message: 'Agent failed' });
    }
  }

  private chatExists(chatId: string): boolean {
    return this.chatService.findAll().some((c) => c.id === chatId);
  }
}
