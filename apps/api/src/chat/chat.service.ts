import { Injectable, NotFoundException } from '@nestjs/common';

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

@Injectable()
export class ChatService {
  private chats: Chat[] = [];
  private messages: Message[] = [];
  private nextId = 1;

  findAll(): Chat[] {
    return [...this.chats];
  }

  create(title?: string): Chat {
    const chat: Chat = {
      id: String(this.nextId++),
      title: title ?? `Chat ${this.chats.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    this.chats.push(chat);
    return chat;
  }

  findMessages(chatId: string): Message[] {
    this.ensureChatExists(chatId);
    return this.messages.filter((m) => m.chatId === chatId);
  }

  addMessage(
    chatId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Message {
    this.ensureChatExists(chatId);
    const message: Message = {
      id: `msg-${this.nextId++}`,
      chatId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(message);
    return message;
  }

  private ensureChatExists(chatId: string): void {
    const chat = this.chats.find((c) => c.id === chatId);
    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} not found`);
    }
  }
}
