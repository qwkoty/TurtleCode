"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  TestTube,
  Check,
  Database,
  BrainCircuit,
  Minimize2,
  BarChart3,
  Coins,
  Zap,
} from "lucide-react";
import { useTurtleCodeStore, Model, AgentStatus } from "@/lib/store";

const statusColor: Record<AgentStatus, string> = {
  idle: "bg-slate-500",
  thinking: "bg-brand-accent",
  editing: "bg-brand-primary",
  plugin: "bg-purple-500",
  complete: "bg-emerald-500",
};

function StatusDot({ status }: { status: AgentStatus }) {
  return (
    <div className="flex h-16 w-16 flex-col items-center justify-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${statusColor[status]} animate-pulse`} />
      <span className="text-[10px] text-slate-400">
        {status === "idle" && "待机"}
        {status === "thinking" && "思考"}
        {status === "editing" && "编辑"}
        {status === "plugin" && "插件"}
        {status === "complete" && "完成"}
      </span>
    </div>
  );
}

const models: { value: Model; label: string; desc: string }[] = [
  { value: "deepseek-v4-flash", label: "DeepSeek V4 Flash", desc: "速度快、成本低，适合日常编码与快速迭代" },
  { value: "deepseek-v4-pro", label: "DeepSeek V4 Pro", desc: "能力更强，适合复杂架构与深度推理" },
];

export default function SettingsPage() {
  const {
    model,
    apiKey,
    enableCache,
    enableSemanticCache,
    enableContextCompression,
    cacheHitRate,
    tokensSaved,
    costSaved,
    setModel,
    setApiKey,
    setCache,
    setSemanticCache,
    setContextCompression,
    agentStatus,
  } = useTurtleCodeStore();

  const [draftKey, setDraftKey] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "ok" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    setDraftKey(apiKey);
  }, [apiKey]);

  const getApiBase = () => {
    if (typeof window === "undefined") return "";
    return window.location.hostname === "localhost" ? "http://localhost:4000" : window.location.origin;
  };

  const handleSave = async () => {
    setApiKey(draftKey);
    try {
      await fetch(`${getApiBase()}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: draftKey, model }),
      });
    } catch {
      // ignore network errors on save
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult("idle");
    setTestMessage("");
    try {
      const res = await fetch(`${getApiBase()}/api/config/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: draftKey }),
      });
      const data = await res.json();
      setTestResult(data.valid ? "ok" : "error");
      setTestMessage(data.message);
    } catch {
      setTestResult("error");
      setTestMessage("请求失败，请检查后端连接");
    } finally {
      setTesting(false);
    }
  };

  const handleModelChange = async (m: Model) => {
    setModel(m);
    try {
      await fetch(`${getApiBase()}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: m }),
      });
    } catch {
      // ignore
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
  }) => (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 ring-1 ring-slate-700/50">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">设置</h1>
          <p className="text-sm text-slate-400">配置模型、密钥与缓存策略</p>
        </div>
        <motion.div
          layout
          className="rounded-2xl bg-slate-900/40 p-3 ring-1 ring-slate-700/40"
        >
          <StatusDot status={agentStatus} />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          {/* 模型选择 */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <BrainCircuit className="h-4 w-4" /> 模型
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {models.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleModelChange(m.value)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                    model === m.value
                      ? "border-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary/40"
                      : "border-slate-700/50 bg-slate-900/30 hover:border-slate-600"
                  }`}
                >
                  <div>
                    <div className="font-medium text-white">{m.label}</div>
                    <div className="text-xs text-slate-400">{m.desc}</div>
                  </div>
                  {model === m.value && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              API 密钥
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">DeepSeek API Key</label>
                <input
                  type="password"
                  value={draftKey}
                  onChange={(e) => setDraftKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
                >
                  <TestTube className="h-4 w-4" />
                  {testing ? "连接中..." : "测试连接"}
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-secondary"
                >
                  <Save className="h-4 w-4" />
                  保存
                </button>
                {testResult === "ok" && (
                  <span className="text-xs text-emerald-400">{testMessage || "连接成功"}</span>
                )}
                {testResult === "error" && (
                  <span className="max-w-[200px] truncate text-xs text-rose-400">
                    {testMessage || "连接失败，请检查密钥"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 功能开关 */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              优化选项
            </h2>
            <div className="space-y-4">
              <Toggle
                icon={Database}
                label="启用缓存"
                desc="缓存重复请求，降低 token 消耗"
                checked={enableCache}
                onChange={setCache}
              />
              <Toggle
                icon={BrainCircuit}
                label="语义缓存"
                desc="基于向量相似度匹配历史结果"
                checked={enableSemanticCache}
                onChange={setSemanticCache}
              />
              <Toggle
                icon={Minimize2}
                label="上下文压缩"
                desc="自动压缩长上下文以提升响应速度"
                checked={enableContextCompression}
                onChange={setContextCompression}
              />
            </div>
          </div>
        </section>

        {/* 统计卡片 */}
        <aside className="space-y-4">
          <StatCard
            icon={BarChart3}
            label="缓存命中率"
            value={`${cacheHitRate.toFixed(1)}%`}
            color="text-brand-highlight"
          />
          <StatCard
            icon={Zap}
            label="节省 Tokens"
            value={tokensSaved.toLocaleString()}
            color="text-brand-accent"
          />
          <StatCard
            icon={Coins}
            label="节省成本"
            value={`$${costSaved.toFixed(4)}`}
            color="text-emerald-400"
          />
        </aside>
      </div>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/30 p-4 hover:border-slate-600/50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60">
          <Icon className="h-4 w-4 text-brand-highlight" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-slate-400">{desc}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-brand-primary" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
