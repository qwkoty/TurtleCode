import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Chat, Message } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAll(): Chat[] {
    return this.chatService.findAll();
  }

  @Post()
  create(@Body() body: { title?: string }): Chat {
    return this.chatService.create(body?.title);
  }

  @Get(':id/messages')
  findMessages(@Param('id') id: string): Message[] {
    return this.chatService.findMessages(id);
  }
}
