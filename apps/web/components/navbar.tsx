"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TurtleAvatar } from "@/components/turtle-avatar";
import { useTurtleCodeStore } from "@/lib/store";

const links = [
  { href: "/workspace", label: "工作区" },
  { href: "/skills", label: "技能" },
  { href: "/settings", label: "设置" },
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
          <span className="text-brand-highlight glow-text">TurtleCode</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl bg-slate-900/40 p-1 sm:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
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
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:inline">AI Agent</span>
          {mounted && <TurtleAvatar status={agentStatus} size="sm" />}
        </div>
      </div>

      {/* 移动端导航 */}
      <nav className="flex items-center justify-around border-t border-slate-700/30 bg-slate-900/60 px-2 py-1.5 sm:hidden">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-medium ${
                active ? "text-brand-highlight" : "text-slate-400"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
