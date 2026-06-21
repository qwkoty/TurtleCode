'use client';

import { useState } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { estimateTokens, estimateCost, generateId } from '@/lib/utils';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const { settings, updateChatStats, chatStats } = useAppStore();

  const inputTokens = estimateTokens(text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    const content = text.trim();
    onSend(content);
    setText('');

    updateChatStats({
      inputTokens: chatStats.inputTokens + inputTokens,
      totalTokens: chatStats.totalTokens + inputTokens,
      estimatedCost: chatStats.estimatedCost + estimateCost(inputTokens, settings.model),
    });
  };

  return (
    <div className="border-t border-white/10 bg-black/20 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="描述你的开发需求..."
              rows={1}
              disabled={disabled}
              className="min-h-[48px] max-h-[160px] w-full resize-none rounded-xl border border-input bg-background/50 px-4 py-3 pr-24 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              style={{ height: 'auto' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                disabled={disabled}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-white/10 disabled:opacity-50"
              >
                <Paperclip size={16} />
              </button>
              <button
                type="button"
                disabled={disabled}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-white/10 disabled:opacity-50"
              >
                <ImageIcon size={16} />
              </button>
            </div>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !text.trim()}
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            <Send size={18} />
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-3">
            <span>输入 Token: {inputTokens}</span>
            <span>输出 Token: {chatStats.outputTokens}</span>
            <span>总 Token: {chatStats.totalTokens}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>预计费用: ${chatStats.estimatedCost.toFixed(6)}</span>
            <span>缓存命中: {(chatStats.cacheHitRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </form>
    </div>
  );
}
