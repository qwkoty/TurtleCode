'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { useAppStore } from '@/store/app-store';
import { generateId, estimateTokens, estimateCost } from '@/lib/utils';

export default function WorkspacePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMessage, setAgentStatus, updateChatStats, chatStats, settings } = useAppStore();

  const handleSend = async (text: string) => {
    const userMessage = {
      id: generateId(),
      role: 'user' as const,
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setIsProcessing(true);
    setAgentStatus('thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, model: settings.model }),
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();

      setTimeout(() => setAgentStatus('editing'), 600);
      setTimeout(() => setAgentStatus('running'), 1200);
      setTimeout(() => setAgentStatus('completed'), 1800);

      const assistantMessage = {
        id: generateId(),
        role: 'assistant' as const,
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      const outputTokens = estimateTokens(data.reply);
      updateChatStats({
        outputTokens: chatStats.outputTokens + outputTokens,
        totalTokens: chatStats.totalTokens + outputTokens,
        estimatedCost: chatStats.estimatedCost + estimateCost(outputTokens, settings.model),
        cacheHitRate: data.cacheHit ? 0.92 : Math.max(0, chatStats.cacheHitRate - 0.02),
      });

      setTimeout(() => addMessage(assistantMessage), 600);
    } catch (error) {
      setAgentStatus('error');
      addMessage({
        id: generateId(),
        role: 'assistant',
        content: '抱歉，小乌龟暂时无法连接。请检查 Settings 中的 API Key 配置。',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setAgentStatus('idle');
      }, 2500);
    }
  };

  return (
    <AppShell>
      <div className="flex h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col w-[70%] min-w-0 border-r border-white/10"
        >
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold">Workspace</h1>
              <span className="text-xs text-muted-foreground">turtlecode-web</span>
            </div>
          </div>
          <MessageList />
          <MessageInput onSend={handleSend} disabled={isProcessing} />
        </motion.div>

        <div className="w-[30%] min-w-0">
          <AgentPanel />
        </div>
      </div>
    </AppShell>
  );
}
