'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

export function MessageList() {
  const { messages } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg font-medium">和小乌龟聊聊你的开发需求</p>
          <p className="mt-2 text-sm">例如：帮我开发一个博客系统</p>
        </div>
      )}
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={cn(
            'flex gap-3',
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
              message.role === 'user'
                ? 'bg-primary/20 border-primary/30'
                : 'bg-turtle-cyan/20 border-turtle-cyan/30'
            )}
          >
            {message.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-turtle-cyan" />}
          </div>
          <div
            className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'glass rounded-bl-md'
            )}
          >
            {message.content}
          </div>
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
