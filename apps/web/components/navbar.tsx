"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TurtleAvatar } from "@/components/turtle-avatar";
import { useTurtleCodeStore } from "@/lib/store";
import { Bot, Code2, Puzzle, Settings } from "lucide-react";

const links = [
  { href: "/workspace", label: "工作区", icon: Code2 },
  { href: "/skills", label: "技能", icon: Puzzle },
  { href: "/settings", label: "设置", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const agentStatus = useTurtleCodeStore((s) => s.agentStatus);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 glass-strong border-b border-slate-700/30">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/workspace"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"
        >
          <Bot className="h-5 w-5 text-brand-highlight" />
          <span className="text-brand-highlight glow-text hidden sm:inline">TurtleCode</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-xl bg-slate-900/40 p-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-brand-primary/20 ring-1 ring-brand-primary/40"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10 hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:inline">AI Agent</span>
          {mounted && <TurtleAvatar status={agentStatus} size="sm" />}
        </div>
      </div>
    </header>
  );
}
