"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Box,
  Globe,
  Database,
  Terminal,
  Cpu,
  Figma,
  Rocket,
  Wrench,
  Settings,
  Power,
  Download,
  Check,
  Search,
} from "lucide-react";
import { TurtleAvatar } from "@/components/turtle-avatar";
import { useTurtleCodeStore } from "@/lib/store";

type Category =
  | "全部"
  | "Development Tools"
  | "Database"
  | "Deploy"
  | "Design"
  | "Browser"
  | "Agent"
  | "MCP";

interface Skill {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, "全部">;
  version: string;
  installed: boolean;
  enabled: boolean;
}

const categories: Category[] = [
  "全部",
  "Development Tools",
  "Database",
  "Deploy",
  "Design",
  "Browser",
  "Agent",
  "MCP",
];

const iconMap: Record<string, React.ElementType> = {
  GitHub: Github,
  Docker: Box,
  Browser: Globe,
  Database: Database,
  "Linux Terminal": Terminal,
  MCP: Cpu,
  Figma: Figma,
  Deploy: Rocket,
};

const initialSkills: Skill[] = [
  {
    id: "github",
    name: "GitHub",
    description: "代码仓库管理、PR 创建与代码审查",
    category: "Development Tools",
    version: "1.2.0",
    installed: true,
    enabled: true,
  },
  {
    id: "docker",
    name: "Docker",
    description: "容器构建、镜像管理与本地运行",
    category: "Development Tools",
    version: "2.1.0",
    installed: true,
    enabled: true,
  },
  {
    id: "browser",
    name: "Browser",
    description: "自动化浏览器操作与页面抓取",
    category: "Browser",
    version: "0.9.0",
    installed: false,
    enabled: false,
  },
  {
    id: "database",
    name: "Database",
    description: "SQL / NoSQL 数据库查询与迁移",
    category: "Database",
    version: "1.0.0",
    installed: true,
    enabled: false,
  },
  {
    id: "linux-terminal",
    name: "Linux Terminal",
    description: "在 Linux 沙箱中执行 shell 命令",
    category: "Development Tools",
    version: "1.5.0",
    installed: true,
    enabled: true,
  },
  {
    id: "mcp",
    name: "MCP",
    description: "模型上下文协议服务端与客户端",
    category: "MCP",
    version: "0.3.0",
    installed: true,
    enabled: true,
  },
  {
    id: "figma",
    name: "Figma",
    description: "读取设计稿、导出资源与标注",
    category: "Design",
    version: "3.0.0",
    installed: false,
    enabled: false,
  },
  {
    id: "deploy",
    name: "Deploy",
    description: "一键部署到 Vercel / Docker / K8s",
    category: "Deploy",
    version: "1.0.0",
    installed: false,
    enabled: false,
  },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [filter, setFilter] = useState<Category>("全部");
  const [query, setQuery] = useState("");
  const agentStatus = useTurtleCodeStore((s) => s.agentStatus);

  const installed = skills.filter((s) => s.installed);

  const filtered = skills.filter((s) => {
    const matchCategory = filter === "全部" || s.category === filter;
    const matchQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  const toggleEnabled = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const install = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, installed: true, enabled: true } : s))
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl gap-6 px-4 py-6 sm:px-6">
      {/* 左侧已安装列表 */}
      <aside className="hidden w-72 flex-col gap-4 md:flex">
        <div className="glass rounded-2xl p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">已安装技能</h2>
            <TurtleAvatar status={agentStatus} size="sm" />
          </div>
          <div className="space-y-2">
            {installed.length === 0 && (
              <div className="text-xs text-slate-500">暂无已安装技能</div>
            )}
            {installed.map((skill) => {
              const Icon = iconMap[skill.name] || Wrench;
              return (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                      <Icon className="h-4 w-4 text-brand-highlight" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{skill.name}</div>
                      <div className="text-[10px] text-slate-400">v{skill.version}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleEnabled(skill.id)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        skill.enabled
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                      title={skill.enabled ? "禁用" : "启用"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                      title="配置"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 右侧市场 */}
      <section className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">技能市场</h1>
            <p className="text-sm text-slate-400">扩展 TurtleCode 的能力边界</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索技能…"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-primary focus:outline-none sm:w-64"
            />
          </div>
        </div>

        {/* 分类 */}
        <div className="scrollbar-thin mb-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === cat
                  ? "bg-brand-primary text-white"
                  : "bg-slate-900/40 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 卡片网格 */}
        <div className="scrollbar-thin grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => {
            const Icon = iconMap[skill.name] || Wrench;
            return (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass flex flex-col rounded-2xl p-5 transition-colors hover:border-brand-primary/30"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-highlight ring-1 ring-brand-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-semibold text-white">{skill.name}</h3>
                  <span className="text-[10px] text-slate-500">v{skill.version}</span>
                </div>
                <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-400">
                  {skill.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-900/60 px-2 py-1 text-[10px] text-slate-400">
                    {skill.category}
                  </span>
                  {skill.installed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> 已安装
                    </span>
                  ) : (
                    <button
                      onClick={() => install(skill.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-secondary"
                    >
                      <Download className="h-3.5 w-3.5" /> 安装
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
