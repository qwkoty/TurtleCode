'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Settings, Puzzle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { PixelTurtle } from '@/components/turtle/PixelTurtle';

const navItems = [
  { href: '/workspace', label: 'Workspace', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/skills', label: 'Skills', icon: Puzzle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, agentStatus } = useAppStore();

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl transition-all duration-300',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        {sidebarOpen && (
          <Link href="/workspace" className="flex items-center gap-2">
            <PixelTurtle status={agentStatus} size={28} />
            <span className="font-bold text-lg tracking-tight">TurtleCode</span>
          </Link>
        )}
        {!sidebarOpen && <PixelTurtle status={agentStatus} size={28} />}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-white/10 text-muted-foreground"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {sidebarOpen && (
        <div className="p-4 border-t border-white/10">
          <div className="glass rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">慢一点思考</p>
            <p className="mt-1">快很多开发。</p>
          </div>
        </div>
      )}
    </aside>
  );
}
