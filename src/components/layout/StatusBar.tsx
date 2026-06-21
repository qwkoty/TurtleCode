'use client';

import { Cpu, Database, Github, Zap } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { formatNumber } from '@/lib/utils';

export function StatusBar() {
  const { settings, chatStats, agentStatus } = useAppStore();

  const statusLabel: Record<string, string> = {
    idle: '待机',
    thinking: '思考中',
    editing: '编辑中',
    running: '运行中',
    completed: '完成',
    error: '错误',
  };

  return (
    <footer className="h-8 flex items-center justify-between px-4 border-t border-white/10 bg-black/30 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Cpu size={12} className="text-turtle-cyan" />
          <span className="font-medium text-foreground">
            {settings.model === 'deepseek-v4-pro' ? 'DeepSeek V4 Pro' : 'DeepSeek V4 Flash'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-turtle-brightCyan" />
          <span>Token: {formatNumber(chatStats.totalTokens, 0)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database size={12} className="text-turtle-lightBlue" />
          <span>缓存: {(chatStats.cacheHitRate * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Github size={12} />
          <span>未连接</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              agentStatus === 'idle'
                ? 'bg-emerald-400'
                : agentStatus === 'error'
                ? 'bg-red-400'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="font-medium text-foreground">{statusLabel[agentStatus]}</span>
        </div>
      </div>
    </footer>
  );
}
