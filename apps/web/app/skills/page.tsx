"use client";

import type { ElementType } from "react";
import { useEffect, useState } from "react";
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
  Power,
  Download,
  Check,
  Search,
  Loader2,
  FolderOpen,
  MousePointerClick,
  MessageSquare,
  Trash2,
} from "lucide-react";

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
  slug: string;
  name: string;
  description: string;
  category?: Category;
  package: string;
  icon: string;
  enabled: boolean;
  status: "not-installed" | "installing" | "installed" | "error";
  error?: string;
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

const iconMap: Record<string, ElementType> = {
  Github,
  Box,
  Globe,
  Database,
  Terminal,
  Cpu,
  Figma,
  Rocket,
  FolderOpen,
  MousePointerClick,
  MessageSquare,
};

const PROJECT_ID = "default-project";

function getApiBase() {
  if (typeof window === "undefined") return "";
  return window.location.hostname === "localhost" ? "http://localhost:4000" : window.location.origin;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category>("全部");
  const [query, setQuery] = useState("");

  const fetchSkills = async () => {
    try {
      const [marketRes, installedRes] = await Promise.all([
        fetch(`${getApiBase()}/api/skills/market`),
        fetch(`${getApiBase()}/api/projects/${PROJECT_ID}/skills`),
      ]);
      const market = (await marketRes.json()) as Skill[];
      const installed = (await installedRes.json()) as Skill[];
      const installedMap = new Map(installed.map((s) => [s.slug, s]));

      setSkills(
        market.map((s) => {
          const ins = installedMap.get(s.slug);
          return {
            ...s,
            enabled: ins?.enabled ?? false,
            status: ins?.status ?? "not-installed",
            error: ins?.error,
          };
        }),
      );
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSkills();
  }, []);

  const installed = skills.filter((s) => s.status !== "not-installed");

  const filtered = skills.filter((s) => {
    const matchCategory = filter === "全部" || s.category === filter;
    const matchQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase()) ||
      s.package.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  const toggleEnabled = async (slug: string, enabled: boolean) => {
    try {
      const res = await fetch(`${getApiBase()}/api/projects/${PROJECT_ID}/skills/${slug}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      const updated = (await res.json()) as Skill | null;
      if (updated) {
        setSkills((prev) =>
          prev.map((s) => (s.slug === slug ? { ...s, enabled: updated.enabled } : s))
        );
      }
    } catch {
      // ignore
    }
  };

  const install = async (slug: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.slug === slug ? { ...s, status: "installing" as const } : s))
    );
    try {
      const res = await fetch(
        `${getApiBase()}/api/projects/${PROJECT_ID}/skills/${slug}/install`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const updated = (await res.json()) as Skill | null;
      if (updated) {
        setSkills((prev) =>
          prev.map((s) =>
            s.slug === slug
              ? { ...s, status: updated.status, enabled: updated.enabled, error: updated.error }
              : s
          )
        );
      }
    } catch {
      setSkills((prev) =>
        prev.map((s) =>
          s.slug === slug ? { ...s, status: "error" as const, error: "网络错误" } : s
        )
      );
    }
  };

  const uninstall = async (slug: string) => {
    try {
      const res = await fetch(`${getApiBase()}/api/projects/${PROJECT_ID}/skills/${slug}`, {
        method: "DELETE",
      });
      const updated = (await res.json()) as Skill | null;
      if (updated) {
        setSkills((prev) =>
          prev.map((s) =>
            s.slug === slug
              ? { ...s, status: updated.status, enabled: updated.enabled, error: updated.error }
              : s
          )
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl gap-6 px-4 py-6 sm:px-6">
      {/* 左侧已安装列表 */}
      <aside className="hidden w-72 flex-col gap-4 md:flex">
        <div className="glass rounded-2xl p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">已安装技能</h2>
          </div>
          <div className="space-y-2">
            {installed.length === 0 && (
              <div className="text-xs text-slate-500">暂无已安装技能</div>
            )}
            {installed.map((skill) => {
              const Icon = iconMap[skill.icon] || Wrench;
              return (
                <div
                  key={skill.slug}
                  className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                      <Icon className="h-4 w-4 text-brand-highlight" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{skill.name}</div>
                      <div className="truncate text-[10px] text-slate-400">{skill.package}</div>
                      {skill.status === "error" && skill.error && (
                        <div className="text-[10px] text-red-400">{skill.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleEnabled(skill.slug, skill.enabled)}
                      disabled={skill.status !== "installed"}
                      className={`rounded-lg p-1.5 transition-colors ${
                        skill.enabled
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-800 text-slate-500"
                      } disabled:opacity-50`}
                      title={skill.enabled ? "禁用" : "启用"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => uninstall(skill.slug)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="卸载"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
            <p className="text-sm text-slate-400">从真实 MCP 服务器市场安装与启用能力</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索技能或包名…"
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
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            加载中…
          </div>
        ) : (
          <div className="scrollbar-thin grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((skill) => {
              const Icon = iconMap[skill.icon] || Wrench;
              return (
                <motion.div
                  key={skill.slug}
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
                    <span className="text-[10px] text-slate-500">{skill.package}</span>
                  </div>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-400">
                    {skill.description}
                  </p>
                  {skill.status === "error" && skill.error && (
                    <p className="mb-2 text-[10px] text-red-400">{skill.error}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-900/60 px-2 py-1 text-[10px] text-slate-400">
                      {skill.category || "MCP"}
                    </span>
                    {skill.status === "installed" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEnabled(skill.slug, skill.enabled)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            skill.enabled
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-slate-800 text-slate-500"
                          }`}
                          title={skill.enabled ? "禁用" : "启用"}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                          <Check className="h-3.5 w-3.5" /> 已安装
                        </span>
                      </div>
                    ) : skill.status === "installing" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> 安装中…
                      </span>
                    ) : (
                      <button
                        onClick={() => install(skill.slug)}
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
        )}
      </section>
    </div>
  );
}
