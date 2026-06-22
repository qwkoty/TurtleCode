"use client";

import type { ElementType } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Code,
  Image as ImageIcon,
  FileText,
  X,
  Cpu,
  BarChart3,
  Terminal,
  FolderGit2,
  PanelLeft,
  PanelRight,
  GitBranch,
  Github,
  FileCode,
  Eye,
  Columns,
  ChevronDown,
} from "lucide-react";
import { CrawlingTurtle } from "@/components/crawling-turtle";
import { DiffViewer } from "@/components/diff-viewer";
import { CodeEditor } from "@/components/code-editor";
import { useTurtleCodeStore, AgentStatus, Attachment, genId } from "@/lib/store";
import { useAgentSocket } from "@/lib/use-agent-socket";
import { getLanguageFromPath } from "@/lib/lang";

const statusLabel: Record<AgentStatus, string> = {
  idle: "待机中",
  thinking: "思考中",
  editing: "编辑中",
  plugin: "调用插件",
  complete: "任务完成",
};

const statusColor: Record<AgentStatus, string> = {
  idle: "bg-slate-500",
  thinking: "bg-brand-accent",
  editing: "bg-brand-primary",
  plugin: "bg-purple-500",
  complete: "bg-emerald-500",
};

const attachmentTypes: { type: Attachment["type"]; icon: ElementType; name: string }[] = [
  { type: "text", icon: Terminal, name: "文本" },
  { type: "code", icon: Code, name: "代码" },
  { type: "file", icon: FileText, name: "文件" },
  { type: "image", icon: ImageIcon, name: "图片" },
];

const MAX_TEXTAREA_ROWS = 5;

function getApiBase() {
  if (typeof window === "undefined") return "";
  return window.location.hostname === "localhost" ? "http://localhost:4000" : "";
}

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  private: boolean;
  defaultBranch: string;
}

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
}

export default function WorkspacePage() {
  const store = useTurtleCodeStore();
  const {
    messages,
    input,
    setInput,
    addMessage,
    model,
    currentProject,
    currentFile,
    currentFileOriginal,
    currentFileModified,
    agentStatus,
    tokenUsage,
    cacheHitRate,
    cost,
    logs,
    isStreaming,
    githubToken,
    setGithubToken,
    githubRepo,
    setGithubRepo,
    codeViewMode,
    setCodeViewMode,
    setCurrentFileChange,
  } = store;

  const { send, simulateTask } = useAgentSocket();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastAgentMsgRef = useRef<HTMLDivElement>(null);

  // GitHub state
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<{ name: string }[]>([]);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [repoTree, setRepoTree] = useState<TreeItem[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.rows = 1;
    const rows = Math.min(MAX_TEXTAREA_ROWS, Math.ceil(ta.scrollHeight / 24));
    ta.rows = Math.max(1, rows);
  }, [input]);

  // Restore GitHub session on mount
  useEffect(() => {
    if (!githubToken) return;
    void (async () => {
      setGithubLoading(true);
      try {
        const connectRes = await fetch(`${getApiBase()}/api/github/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: githubToken }),
        });
        const connectData = (await connectRes.json()) as {
          success: boolean;
          login?: string;
          message?: string;
        };
        if (!connectData.success) {
          setGithubLogin(null);
          setGithubConnected(false);
          return;
        }
        setGithubConnected(true);
        setGithubLogin(connectData.login ?? null);

        const reposRes = await fetch(`${getApiBase()}/api/github/repos`);
        const reposData = (await reposRes.json()) as GitHubRepo[];
        setRepos(reposData);

        if (githubRepo) {
          setSelectedRepoFullName(`${githubRepo.owner}/${githubRepo.repo}`);
          setSelectedBranch(githubRepo.branch);
          await loadBranches(githubRepo.owner, githubRepo.repo);
          await loadTree(githubRepo.owner, githubRepo.repo, githubRepo.branch);
        }
      } finally {
        setGithubLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    const text = input.trim();
    addMessage({
      id: genId(),
      role: "user",
      content: text,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    });
    setInput("");
    setAttachments([]);
    const sent = send(text);
    if (!sent) simulateTask();
  };

  const addAttachment = (type: Attachment["type"]) => {
    const names: Record<Attachment["type"], string> = {
      text: "note.txt",
      code: "snippet.ts",
      file: "archive.zip",
      image: "screenshot.png",
    };
    setAttachments((prev) => [
      ...prev,
      { type, name: names[type], content: type === "text" ? "示例文本" : "..." },
    ]);
    setShowAttachMenu(false);
  };

  const modelLabel = model === "deepseek-v4-pro" ? "DeepSeek V4 Pro" : "DeepSeek V4 Flash";

  // GitHub helpers
  const connectGitHub = async () => {
    if (!githubToken.trim()) return;
    setGithubLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/github/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: githubToken }),
      });
      const data = (await res.json()) as { success: boolean; login?: string; message?: string };
      if (data.success) {
        setGithubConnected(true);
        setGithubLogin(data.login ?? null);
        const reposRes = await fetch(`${getApiBase()}/api/github/repos`);
        setRepos(((await reposRes.json()) as GitHubRepo[]) || []);
      } else {
        setGithubConnected(false);
        setGithubLogin(null);
        alert(data.message || "GitHub Token 无效");
      }
    } finally {
      setGithubLoading(false);
    }
  };

  const loadBranches = async (owner: string, repo: string) => {
    const res = await fetch(`${getApiBase()}/api/github/repos/${owner}/${repo}/branches`);
    const data = (await res.json()) as { name: string }[];
    setBranches(data || []);
  };

  const loadTree = async (owner: string, repo: string, branch: string) => {
    const res = await fetch(
      `${getApiBase()}/api/github/repos/${owner}/${repo}/tree?branch=${encodeURIComponent(branch)}`,
    );
    const data = (await res.json()) as { tree: TreeItem[] };
    setRepoTree((data?.tree || []).filter((t) => t.type === "blob"));
  };

  const handleRepoChange = async (fullName: string) => {
    setSelectedRepoFullName(fullName);
    setSelectedBranch("");
    const repo = repos.find((r) => r.fullName === fullName);
    if (!repo) return;
    await loadBranches(repo.fullName.split("/")[0], repo.name);
    setSelectedBranch(repo.defaultBranch);
    await applyRepoSelection(repo.fullName, repo.defaultBranch);
  };

  const handleBranchChange = async (branch: string) => {
    setSelectedBranch(branch);
    if (!selectedRepoFullName) return;
    await applyRepoSelection(selectedRepoFullName, branch);
  };

  const applyRepoSelection = async (fullName: string, branch: string) => {
    const [owner, repo] = fullName.split("/");
    await fetch(`${getApiBase()}/api/github/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, repo, branch }),
    });
    setGithubRepo({ owner, repo, branch });
    await loadTree(owner, repo, branch);
  };

  const openTreeFile = async (path: string) => {
    if (!githubRepo) return;
    const res = await fetch(
      `${getApiBase()}/api/github/repos/${githubRepo.owner}/${githubRepo.repo}/contents?path=${encodeURIComponent(path)}&branch=${encodeURIComponent(githubRepo.branch)}`,
    );
    const data = (await res.json()) as { content: string | null };
    const content = data.content ?? `// 无法读取 ${path}\n`;
    setCurrentFileChange(path, content, content);
    setCodeViewMode("file");
  };

  const codeLanguage = currentFile ? getLanguageFromPath(currentFile) : "typescript";

  const RepoPanelBody = (
    <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto p-3 sm:p-4">
      {/* GitHub 连接 */}
      <div className="space-y-2 rounded-xl border border-slate-700/30 bg-slate-900/40 p-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Github className="h-3.5 w-3.5" /> GitHub
        </h3>
        {githubConnected ? (
          <div className="text-xs text-emerald-400">已连接 {githubLogin ? `· ${githubLogin}` : ""}</div>
        ) : (
          <div className="space-y-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-primary/60 focus:outline-none"
            />
            <button
              onClick={connectGitHub}
              disabled={githubLoading}
              className="w-full rounded-lg bg-brand-primary py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
            >
              {githubLoading ? "连接中…" : "连接 GitHub"}
            </button>
          </div>
        )}
      </div>

      {/* 仓库 / 分支 */}
      <div className="space-y-2 rounded-xl border border-slate-700/30 bg-slate-900/40 p-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <FolderGit2 className="h-3.5 w-3.5" /> 当前仓库
        </h3>
        <div className="relative">
          <select
            value={selectedRepoFullName}
            onChange={(e) => void handleRepoChange(e.target.value)}
            disabled={!githubConnected || repos.length === 0}
            className="w-full appearance-none rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2 text-xs text-white focus:border-brand-primary/60 focus:outline-none disabled:opacity-50"
          >
            <option value="">选择仓库…</option>
            {repos.map((r) => (
              <option key={r.id} value={r.fullName}>
                {r.fullName}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        </div>
        <div className="relative">
          <select
            value={selectedBranch}
            onChange={(e) => void handleBranchChange(e.target.value)}
            disabled={!selectedRepoFullName || branches.length === 0}
            className="w-full appearance-none rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2 text-xs text-white focus:border-brand-primary/60 focus:outline-none disabled:opacity-50"
          >
            <option value="">选择分支…</option>
            {branches.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          <GitBranch className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        </div>
        {githubRepo && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="truncate rounded bg-slate-800 px-2 py-1 text-brand-highlight">
              {githubRepo.owner}/{githubRepo.repo}
            </span>
            <span className="rounded bg-slate-800 px-2 py-1">{githubRepo.branch}</span>
          </div>
        )}
      </div>

      {/* 当前改动文件 */}
      <div className="space-y-2 rounded-xl border border-slate-700/30 bg-slate-900/40 p-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <FileCode className="h-3.5 w-3.5" /> 改动文件
        </h3>
        {currentFile ? (
          <button
            onClick={() => {
              setCodeViewMode("diff");
              setShowRightPanel(false);
            }}
            className="flex w-full items-center justify-between rounded-lg bg-brand-primary/10 px-2 py-1.5 text-xs text-brand-highlight ring-1 ring-brand-primary/30 transition-colors hover:bg-brand-primary/20"
          >
            <span className="truncate">{currentFile}</span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-brand-highlight"
            />
          </button>
        ) : (
          <div className="rounded-lg bg-slate-950/40 px-2 py-1.5 text-xs text-slate-500">暂无文件变更</div>
        )}
      </div>

      {/* 仓库文件树 */}
      <div className="flex min-h-0 flex-1 flex-col space-y-2 rounded-xl border border-slate-700/30 bg-slate-900/40 p-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Columns className="h-3.5 w-3.5" /> 仓库文件
        </h3>
        <div className="scrollbar-thin min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {repoTree.length === 0 && (
            <div className="text-xs text-slate-600">选择仓库后显示文件树</div>
          )}
          {repoTree.slice(0, 80).map((item) => (
            <button
              key={item.sha + item.path}
              onClick={() => void openTreeFile(item.path)}
              className="w-full truncate rounded px-1.5 py-1 text-left text-[10px] text-slate-400 hover:bg-slate-800 hover:text-white"
              title={item.path}
            >
              {item.path}
            </button>
          ))}
        </div>
      </div>

      {/* 日志 */}
      <div className="flex min-h-0 flex-[0.4] flex-col space-y-2 rounded-xl border border-slate-700/30 bg-slate-900/40 p-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Terminal className="h-3.5 w-3.5" /> 代理日志
        </h3>
        <div className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto rounded-lg bg-slate-950/40 p-2 text-[10px] text-slate-400 sm:text-xs">
          {logs.length === 0 && <div className="text-slate-600">等待任务开始…</div>}
          {logs.slice(0, 40).map((log, i) => (
            <div key={i} className="font-mono leading-tight">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CodePanelBody = (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 标签栏 */}
      <div className="flex h-12 min-h-[3rem] items-center justify-between border-b border-slate-700/30 px-3">
        <div className="flex items-center gap-1 rounded-lg bg-slate-900/60 p-1">
          <button
            onClick={() => setCodeViewMode("file")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
              codeViewMode === "file"
                ? "bg-brand-primary text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" /> 当前文件
          </button>
          <button
            onClick={() => setCodeViewMode("diff")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
              codeViewMode === "diff"
                ? "bg-brand-primary text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Columns className="h-3.5 w-3.5" /> Diff 对比
          </button>
        </div>
        {currentFile && (
          <span className="max-w-[50%] truncate text-[10px] text-slate-400" title={currentFile}>
            {currentFile}
          </span>
        )}
      </div>

      {/* 编辑器 / Diff */}
      <div className="min-h-0 flex-1 p-3">
        {!currentFile ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-700/30 bg-slate-900/20 p-4 text-center text-xs text-slate-500">
            <Eye className="h-8 w-8 text-slate-600" />
            <p>Agent 生成或选择文件后将在此展示代码</p>
          </div>
        ) : codeViewMode === "file" ? (
          <CodeEditor value={currentFileModified} language={codeLanguage} className="h-full" />
        ) : (
          <DiffViewer
            original={currentFileOriginal}
            modified={currentFileModified}
            language={codeLanguage}
            className="h-full"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* 左侧代码区 - 桌面 */}
        <section className="hidden min-h-0 flex-col border-r border-slate-700/30 bg-slate-900/20 lg:flex lg:w-[30%]">
          <div className="flex h-12 min-h-[3rem] items-center border-b border-slate-700/30 px-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Code className="h-4 w-4 text-brand-highlight" /> 代码
            </h2>
          </div>
          {CodePanelBody}
        </section>

        {/* 中间聊天区 */}
        <section className="flex min-h-0 flex-1 flex-col lg:w-[40%]">
          <div className="flex h-12 min-h-[3rem] items-center justify-between border-b border-slate-700/30 bg-slate-900/40 px-3 sm:px-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <button
                onClick={() => setShowLeftPanel(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60 text-slate-300 transition-colors hover:bg-slate-800 lg:hidden"
                aria-label="打开代码区"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-brand-highlight ring-1 ring-brand-primary/20">
                {modelLabel}
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                <FolderGit2 className="h-3 w-3" /> {currentProject}
              </span>
            </div>
            <button
              onClick={() => setShowRightPanel(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60 text-slate-300 transition-colors hover:bg-slate-800 lg:hidden"
              aria-label="打开仓库区"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          </div>

          {/* 聊天历史 */}
          <div
            ref={scrollRef}
            className="scrollbar-thin relative min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:space-y-4 sm:p-4"
          >
            <CrawlingTurtle
              status={agentStatus}
              containerRef={scrollRef}
              targetRef={lastAgentMsgRef}
            />
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isLastAgent = msg.role === "agent" && idx === messages.length - 1;
                return (
                  <motion.div
                    key={msg.id}
                    ref={isLastAgent ? lastAgentMsgRef : undefined}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[80%] md:text-base ${
                        msg.role === "user" ? "bg-brand-primary text-white" : "glass text-slate-200"
                      }`}
                    >
                      {msg.content}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.attachments.map((a, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-900/60 px-2 py-1 text-[10px] text-slate-300 sm:text-xs"
                            >
                              <Paperclip className="h-3 w-3" /> {a.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {isStreaming && (
              <div className="flex justify-start">
                <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2 text-xs text-slate-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-highlight" />
                  TurtleCode 正在输入…
                </div>
              </div>
            )}
          </div>

          {/* 底部输入 */}
          <div className="border-t border-slate-700/30 bg-slate-900/40 p-3 pb-safe sm:p-4">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300"
                  >
                    {a.type === "image" && <ImageIcon className="h-3 w-3" />}
                    {a.type === "code" && <Code className="h-3 w-3" />}
                    {a.type === "file" && <FileText className="h-3 w-3" />}
                    {a.type === "text" && <Terminal className="h-3 w-3" />}
                    {a.name}
                    <button
                      onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))}
                      className="ml-0.5 rounded p-0.5 hover:bg-slate-700"
                    >
                      <X className="h-3 w-3 hover:text-white" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-2 focus-within:border-brand-primary/60 focus-within:ring-1 focus-within:ring-brand-primary/30">
              <div className="relative">
                <button
                  onClick={() => setShowAttachMenu((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white active:scale-95"
                  aria-label="添加附件"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {showAttachMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAttachMenu(false)}
                        className="fixed inset-0 z-10 lg:hidden"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute bottom-full left-0 z-20 mb-2 w-40 rounded-xl border border-slate-700/50 bg-slate-900 p-1.5 shadow-xl"
                      >
                        {attachmentTypes.map((t) => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.type}
                              onClick={() => addAttachment(t.type)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                            >
                              <Icon className="h-4 w-4" /> {t.name}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入需求，让海龟开始工作…"
                rows={1}
                className="max-h-32 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none sm:max-h-40 sm:text-base"
              />
              <button
                onClick={handleSend}
                disabled={isStreaming}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                aria-label="发送"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 sm:text-xs">
              <span className="hidden sm:inline">按 Enter 发送，Shift + Enter 换行</span>
              <span className="sm:hidden">Enter 发送</span>
              <span>{tokenUsage.toLocaleString()} tokens · ${cost.toFixed(4)}</span>
            </div>
          </div>
        </section>

        {/* 右侧仓库区 - 桌面 */}
        <section className="hidden min-h-0 flex-col border-l border-slate-700/30 bg-slate-900/20 lg:flex lg:w-[30%]">
          <div className="flex h-12 min-h-[3rem] items-center border-b border-slate-700/30 px-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <FolderGit2 className="h-4 w-4 text-brand-highlight" /> 仓库 / 分支
            </h2>
          </div>
          {RepoPanelBody}
        </section>

        {/* 移动端左侧代码抽屉 */}
        <AnimatePresence>
          {showLeftPanel && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLeftPanel(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.section
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[88%] flex-col border-r border-slate-700/30 bg-slate-950/95 backdrop-blur-xl sm:w-[380px] lg:hidden"
              >
                <div className="flex h-12 min-h-[3rem] items-center justify-between border-b border-slate-700/30 px-4">
                  <h2 className="text-sm font-semibold text-white">代码</h2>
                  <button
                    onClick={() => setShowLeftPanel(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {CodePanelBody}
              </motion.section>
            </>
          )}
        </AnimatePresence>

        {/* 移动端右侧仓库抽屉 */}
        <AnimatePresence>
          {showRightPanel && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRightPanel(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.section
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-50 flex w-[88%] flex-col border-l border-slate-700/30 bg-slate-950/95 backdrop-blur-xl sm:w-[380px] lg:hidden"
              >
                <div className="flex h-12 min-h-[3rem] items-center justify-between border-b border-slate-700/30 px-4">
                  <h2 className="text-sm font-semibold text-white">仓库 / 分支</h2>
                  <button
                    onClick={() => setShowRightPanel(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {RepoPanelBody}
              </motion.section>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 底部状态栏 */}
      <footer className="flex h-9 min-h-[2.25rem] items-center justify-between border-t border-slate-700/30 bg-slate-950/60 px-3 text-[11px] text-slate-400 sm:px-4 sm:text-xs">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-brand-highlight" />
            <span className="hidden sm:inline">{modelLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" /> {cacheHitRate.toFixed(1)}%
          </span>
          {githubRepo && (
            <span className="hidden items-center gap-1 md:flex">
              <GitBranch className="h-3 w-3" />
              <span className="truncate">{githubRepo.repo}:{githubRepo.branch}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${statusColor[agentStatus]}`} />
            {statusLabel[agentStatus]}
          </span>
        </div>
      </footer>
    </div>
  );
}
