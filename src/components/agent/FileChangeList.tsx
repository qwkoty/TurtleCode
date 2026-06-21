'use client';

import { useState } from 'react';
import { FilePlus, FileEdit, FileMinus, ChevronDown, ChevronRight } from 'lucide-react';
import { FileChange } from '@/types';
import { cn } from '@/lib/utils';

interface FileChangeListProps {
  changes: FileChange[];
}

export function FileChangeList({ changes }: FileChangeListProps) {
  const [expanded, setExpanded] = useState<string[]>([changes[0]?.id]);

  const toggle = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const iconMap = {
    added: <FilePlus size={14} className="text-emerald-400" />,
    modified: <FileEdit size={14} className="text-amber-400" />,
    deleted: <FileMinus size={14} className="text-red-400" />,
  };

  return (
    <div className="space-y-2">
      {changes.map((change) => {
        const isOpen = expanded.includes(change.id);
        return (
          <div
            key={change.id}
            className="rounded-lg border border-white/10 bg-black/20 overflow-hidden"
          >
            <button
              onClick={() => toggle(change.id)}
              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-white/5"
            >
              <div className="flex items-center gap-2 min-w-0">
                {iconMap[change.status]}
                <span className="truncate text-xs font-mono">{change.filePath}</span>
              </div>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isOpen && (
              <div className="border-t border-white/10 bg-black/40 p-3">
                <pre className="text-[10px] font-mono leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {change.diff.split('\n').map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        'px-1',
                        line.startsWith('+') && 'bg-emerald-500/10 text-emerald-300',
                        line.startsWith('-') && 'bg-red-500/10 text-red-300'
                      )}
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
