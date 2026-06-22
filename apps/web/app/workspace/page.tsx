"use client";

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
  Bot,
} from "lucide-react";
import { TurtleAvatar } from "@/components/turtle-avatar";
import { DiffViewer } from "@/components/diff-viewer";
import { useTurtleCodeStore, AgentStatus, Attachment, genId } from "@/lib/store";
import { useAgentSocket } from "@/lib/use-agent-socket";

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

const mockFiles = [
  "src/utils/cache.ts",
  "src/components/avatar.tsx",
  "src/hooks/useAgentSocket.ts",
  "src/lib/store.ts",
];

export default function WorkspacePage() {
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
  } = useTurtleCodeStore();

  const { send, simulateTask } = useAgentSocket();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    addMessage({
      id: genId(),
      role: "user",
      content: input,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    });
    setInput("");
    setAttachments([]);
    const sent = send(input);
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
  };

  const modelLabel = model === "deepseek-reasoner" ? "DeepSeek Reasoner" : "DeepSeek Chat";

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col md:h-[calc(100vh-3.5rem)]">
      {/* 主工作区：移动端单列，桌面端 70/30 */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* 左侧聊天 */}
        <section className="flex flex-1 flex-col border-r border-slate-700/30 md:w-[70%]">
          {/* 顶部栏 */}
          <div className="flex h-12 items-center justify-between border-b border-slate-700/30 bg-slate-900/40 px-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bot className="h-4 w-4 text-brand-highlight" />
              TurtleCode
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-brand-highlight ring-1 ring-brand-primary/20">
                {modelLabel}
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                <FolderGit2 className="h-3 w-3" /> {currentProject}
              </span>
              <button
                onClick={() => setShowSidebar((v) => !v)}
                className="rounded-lg bg-slate-800/60 p-1.5 text-slate-300 hover:bg-slate-800 md:hidden"
              >
                <Code className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 聊天历史 */}
          <div
            ref={scrollRef}
            className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3 sm:p-4"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-brand-primary text-white"
                        : "glass text-slate-200"
                    }`}
                  >
                    {msg.content}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.attachments.map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900/60 px-2 py-1 text-[10px] text-slate-300"
                          >
                            <Paperclip className="h-3 w-3" /> {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
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
          <div className="border-t border-slate-700/30 bg-slate-900/40 p-3 sm:p-4">
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
                    <button onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))}>
                      <X className="h-3 w-3 hover:text-white" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-2 focus-within:border-brand-primary/60 focus-within:ring-1 focus-within:ring-brand-primary/30">
              <textarea
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
                className="max-h-28 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none sm:max-h-32"
              />
              <div className="flex items-center gap-0.5 sm:gap-1">
                <AttachButton icon={Terminal} onClick={() => addAttachment("text")} />
                <AttachButton icon={Code} onClick={() => addAttachment("code")} />
                <AttachButton icon={FileText} onClick={() => addAttachment("file")} />
                <AttachButton icon={ImageIcon} onClick={() => addAttachment("image")} />
                <button
                  onClick={handleSend}
                  disabled={isStreaming}
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-2 hidden text-[10px] text-slate-500 sm:block">
              按 Enter 发送，Shift + Enter 换行
            </div>
          </div>
        </section>

        {/* 桌面端右侧代理工作区 */}
        <section className="hidden w-[30%] flex-col border-l border-slate-700/30 bg-slate-900/20 md:flex">
          <SidebarContent
            currentFile={currentFile}
            currentFileOriginal={currentFileOriginal}
            currentFileModified={currentFileModified}
            logs={logs}
            onClose={() => setShowSidebar(false)}
          />
        </section>

        {/* 移动端抽屉 */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSidebar(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              />
              <motion.section
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-50 flex w-[85%] flex-col border-l border-slate-700/30 bg-slate-950/95 backdrop-blur-xl sm:w-[380px] md:hidden"
              >
                <SidebarContent
                  currentFile={currentFile}
                  currentFileOriginal={currentFileOriginal}
                  currentFileModified={currentFileModified}
                  logs={logs}
                  onClose={() => setShowSidebar(false)}
                />
              </motion.section>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 底部状态栏 */}
      <footer className="flex h-8 items-center justify-between border-t border-slate-700/30 bg-slate-950/60 px-3 text-[11px] text-slate-400 sm:px-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-brand-highlight" />
            <span>{modelLabel}</span>
          </span>
          <span className="hidden sm:inline">Token {tokenUsage.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" /> {cacheHitRate.toFixed(1)}%
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className={`h-2 w-2 rounded-full ${statusColor[agentStatus]}`} />
            {statusLabel[agentStatus]}
          </span>
          <TurtleAvatar status={agentStatus} size="sm" />
        </div>
      </footer>
    </div>
  );
}

function AttachButton({
  icon: Icon,
  onClick,
}: {
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white sm:h-8 sm:w-8"
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  );
}

function SidebarContent({
  currentFile,
  currentFileOriginal,
  currentFileModified,
  logs,
  onClose,
}: {
  currentFile: string | null;
  currentFileOriginal: string;
  currentFileModified: string;
  logs: string[];
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex h-12 items-center justify-between border-b border-slate-700/30 px-4 md:hidden">
        <span className="text-sm font-semibold text-white">代理工作区</span>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 当前编辑文件 */}
      <div className="border-b border-slate-700/30 p-3 sm:p-4">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Code className="h-3.5 w-3.5" /> 正在编辑
        </h3>
        <div className="space-y-1.5">
          {mockFiles.map((file) => (
            <div
              key={file}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs ${
                currentFile === file
                  ? "bg-brand-primary/10 text-brand-highlight ring-1 ring-brand-primary/30"
                  : "bg-slate-900/40 text-slate-400"
              }`}
            >
              <span className="truncate">{file}</span>
              {currentFile === file && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-brand-highlight"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Diff 查看器 */}
      <div className="flex flex-1 flex-col border-b border-slate-700/30 p-3 sm:p-4">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <FolderGit2 className="h-3.5 w-3.5" /> 代码变更
        </h3>
        <div className="flex-1 overflow-hidden">
          <DiffViewer
            original={currentFileOriginal}
            modified={currentFileModified}
            language="typescript"
            className="h-full"
          />
        </div>
      </div>

      {/* 状态日志 */}
      <div className="h-1/3 p-3 sm:p-4">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Terminal className="h-3.5 w-3.5" /> 代理日志
        </h3>
        <div className="scrollbar-thin h-[calc(100%-1.5rem)] space-y-1 overflow-y-auto rounded-xl border border-slate-700/30 bg-slate-950/40 p-2 text-[10px] text-slate-400">
          {logs.slice(0, 40).map((log, i) => (
            <div key={i} className="font-mono leading-tight">
              {log}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
