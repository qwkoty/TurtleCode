'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { PixelTurtle } from '@/components/turtle/PixelTurtle';
import { sampleFileChanges, sampleAgentTasks } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { FileChangeList } from './FileChangeList';

export function AgentPanel() {
  const { agentStatus } = useAppStore();

  const statusConfig = {
    idle: { label: '待机中', color: 'text-emerald-400' },
    thinking: { label: '思考中', color: 'text-amber-400' },
    editing: { label: '编辑代码', color: 'text-turtle-cyan' },
    running: { label: '运行任务', color: 'text-turtle-cyan' },
    completed: { label: '任务完成', color: 'text-emerald-400' },
    error: { label: '执行出错', color: 'text-red-400' },
  };

  return (
    <div className="flex h-full flex-col border-l border-white/10 bg-black/20">
      <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
        <PixelTurtle status={agentStatus} size={36} />
        <div>
          <p className="text-sm font-medium">小乌龟 Agent</p>
          <p className={cn('text-xs', statusConfig[agentStatus].color)}>
            {statusConfig[agentStatus].label}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            执行步骤
          </h4>
          <div className="space-y-2">
            {sampleAgentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 rounded-lg bg-white/5 p-2.5 text-sm"
              >
                {task.status === 'running' ? (
                  <Loader2 size={16} className="mt-0.5 animate-spin text-turtle-cyan" />
                ) : task.status === 'success' ? (
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-400" />
                ) : (
                  <XCircle size={16} className="mt-0.5 text-red-400" />
                )}
                <span className="text-xs leading-relaxed">{task.message}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            文件变更
          </h4>
          <FileChangeList changes={sampleFileChanges} />
        </section>
      </div>
    </div>
  );
}
