"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTurtleCodeStore, AgentStatus } from "@/lib/store";

export type AgentEvent =
  | { type: "agent:status"; status: AgentStatus }
  | { type: "agent:fileChange"; file: string; original: string; modified: string }
  | { type: "agent:delta"; content: string }
  | { type: "agent:complete" }
  | { type: "stats:update"; cacheHitRate?: number; tokensSaved?: number; costSaved?: number };

const WS_URL = "ws://localhost:4000";

const mockFileChanges = [
  {
    file: "src/utils/cache.ts",
    original: `export function get(key: string) {\n  return localStorage.getItem(key);\n}\n\nexport function set(key: string, value: string) {\n  localStorage.setItem(key, value);\n}`,
    modified: `import { createHash } from "crypto";\n\nexport function get(key: string) {\n  const hash = createHash("sha256").update(key).digest("hex");\n  return localStorage.getItem(hash);\n}\n\nexport function set(key: string, value: string) {\n  const hash = createHash("sha256").update(key).digest("hex");\n  localStorage.setItem(hash, value);\n}`,
  },
  {
    file: "src/components/avatar.tsx",
    original: `function Avatar({ src }) {\n  return <img src={src} />;\n}`,
    modified: `import Image from "next/image";\n\nfunction Avatar({ src, alt }) {\n  return <Image src={src} alt={alt} width={40} height={40} className="rounded-full" />;\n}`,
  },
];

const deltas = [
  "好的，我来处理这个需求。",
  "\n\n首先分析了缓存模块，发现直接使用原始 key 存储存在安全隐患。",
  "\n\n我已经为 key 添加了 SHA-256 哈希，并补全了类型导入。",
  "\n\n同时把 Avatar 组件替换为 Next.js 的 Image 组件以优化性能。",
  "\n\n任务已完成，请查看右侧的 diff。",
];

export function useAgentSocket() {
  const wsRef = useRef<WebSocket | null>(null);

  const applyEvent = useCallback((event: AgentEvent) => {
    const s = useTurtleCodeStore.getState();
    switch (event.type) {
      case "agent:status":
        s.setAgentStatus(event.status);
        s.addLog(`代理状态切换为 ${event.status}`);
        break;
      case "agent:fileChange":
        s.setCurrentFileChange(event.file, event.original, event.modified);
        s.addLog(`正在编辑文件 ${event.file}`);
        break;
      case "agent:delta":
        s.appendDelta(event.content);
        s.updateStats({
          tokenUsage: s.tokenUsage + Math.floor(Math.random() * 8 + 3),
          cost: s.cost + Math.random() * 0.002,
        });
        break;
      case "agent:complete":
        s.setAgentStatus("complete");
        s.addLog("任务执行完毕");
        setTimeout(() => s.setAgentStatus("idle"), 2500);
        break;
      case "stats:update":
        s.updateStats({
          cacheHitRate: event.cacheHitRate ?? s.cacheHitRate,
          tokensSaved: event.tokensSaved ?? s.tokensSaved,
          costSaved: event.costSaved ?? s.costSaved,
        });
        s.addLog("统计信息已更新");
        break;
    }
  }, []);

  const simulateTask = useCallback(() => {
    const s = useTurtleCodeStore.getState();
    s.setStreaming(true);
    s.addMessage({
      id: crypto.randomUUID(),
      role: "agent",
      content: "",
    });

    let step = 0;
    const file = mockFileChanges[Math.floor(Math.random() * mockFileChanges.length)];

    const interval = setInterval(() => {
      step++;
      if (step === 1) applyEvent({ type: "agent:status", status: "thinking" });
      if (step === 3) applyEvent({ type: "agent:status", status: "editing" });
      if (step === 4) applyEvent({ type: "agent:fileChange", ...file });
      if (step >= 5 && step <= 9) {
        applyEvent({ type: "agent:delta", content: deltas[step - 5] || "." });
      }
      if (step === 10) {
        applyEvent({ type: "stats:update", cacheHitRate: 48, tokensSaved: s.tokensSaved + 1240 });
      }
      if (step === 12) {
        applyEvent({ type: "agent:complete" });
        s.setStreaming(false);
        clearInterval(interval);
      }
    }, 700);
  }, [applyEvent]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const addLog = useTurtleCodeStore.getState().addLog;
    let closed = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog("已连接到 TurtleCode 后端");
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as AgentEvent;
          applyEvent(data);
        } catch {
          addLog(`收到无法解析的消息: ${String(ev.data).slice(0, 80)}`);
        }
      };

      ws.onclose = () => {
        if (closed) return;
        addLog("WebSocket 已断开，启用模拟模式");
        if (!fallbackTimer) fallbackTimer = setTimeout(simulateTask, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      addLog("WebSocket 连接失败，启用模拟模式");
      if (!fallbackTimer) fallbackTimer = setTimeout(simulateTask, 2000);
    }

    return () => {
      closed = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      wsRef.current?.close();
    };
  }, [applyEvent, simulateTask]);

  const send = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", message }));
    }
  }, []);

  return { send, simulateTask };
}
