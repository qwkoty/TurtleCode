"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useTurtleCodeStore, genId } from "@/lib/store";
import type { AgentStatus } from "@/lib/store";

export type AgentEvent =
  | { type: "agent:status"; status: AgentStatus }
  | { type: "agent:fileChange"; file: string; original: string; modified: string }
  | { type: "agent:delta"; content: string }
  | { type: "agent:complete"; usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number; costUsd?: number } }
  | { type: "agent:error"; message: string }
  | { type: "stats:update"; cacheHitRate?: number; tokensSaved?: number; costSaved?: number };

function getSocketUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) return api;
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:4000";
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function useAgentSocket() {
  const socketRef = useRef<Socket | null>(null);

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
        break;
      case "agent:error":
        s.addLog(`错误: ${event.message}`);
        s.setStreaming(false);
        s.setAgentStatus("idle");
        break;
      case "agent:complete": {
        const usage = event.usage;
        if (usage) {
          const total = usage.totalTokens ?? 0;
          const cost = usage.costUsd ?? 0;
          const rate = s.cacheHitRate / 100;
          s.updateStats({
            tokenUsage: s.tokenUsage + total,
            cost: s.cost + cost,
            tokensSaved: s.tokensSaved + Math.floor(total * rate),
            costSaved: s.costSaved + cost * rate,
          });
        }
        s.setAgentStatus("complete");
        s.addLog("任务执行完毕");
        s.setStreaming(false);
        setTimeout(() => s.setAgentStatus("idle"), 2500);
        break;
      }
      case "stats:update":
        s.updateStats({
          cacheHitRate: event.cacheHitRate ?? s.cacheHitRate,
          tokensSaved: event.tokensSaved ?? s.tokensSaved,
          costSaved: event.costSaved ?? s.costSaved,
        });
        break;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = getSocketUrl();
    if (!url) {
      useTurtleCodeStore.getState().addLog("未配置 API 地址");
      return;
    }

    const socket = io(url, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    socketRef.current = socket;

    const addLog = useTurtleCodeStore.getState().addLog;

    socket.on("connect", () => {
      addLog("已连接到 TurtleCode 后端");
    });

    socket.on("agent:status", (data: { status: AgentStatus }) =>
      applyEvent({ type: "agent:status", status: data.status }),
    );
    socket.on("agent:fileChange", (data: { file: string; original: string; modified: string }) =>
      applyEvent({ type: "agent:fileChange", ...data }),
    );
    socket.on("agent:delta", (data: { content: string }) =>
      applyEvent({ type: "agent:delta", content: data.content }),
    );
    socket.on("agent:complete", (data: { usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number; costUsd?: number } }) =>
      applyEvent({ type: "agent:complete", usage: data.usage }),
    );
    socket.on("agent:error", (data: { message?: string }) =>
      applyEvent({ type: "agent:error", message: data.message ?? "未知错误" }),
    );
    socket.on("stats:update", (data: { cacheHitRate?: number; tokensSaved?: number; costSaved?: number }) =>
      applyEvent({ type: "stats:update", ...data }),
    );

    socket.on("connect_error", (err) => {
      addLog(`连接异常: ${err.message}`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [applyEvent]);

  const send = useCallback((message: string) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("chat:send", { content: message });
      return true;
    }
    return false;
  }, []);

  const simulateTask = useCallback(() => {
    const s = useTurtleCodeStore.getState();
    s.setStreaming(true);
    s.addMessage({
      id: genId(),
      role: "agent",
      content: "",
    });

    const steps: AgentEvent[] = [
      { type: "agent:status", status: "thinking" },
      { type: "agent:status", status: "editing" },
      {
        type: "agent:fileChange",
        file: "src/utils/demo.ts",
        original: "// demo",
        modified: "// demo updated",
      },
      { type: "agent:status", status: "plugin" },
      { type: "agent:delta", content: "后端未连接，正在使用本地演示模式。" },
      {
        type: "agent:complete",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
      },
    ];

    let i = 0;
    const interval = setInterval(() => {
      const event = steps[i++];
      if (event) applyEvent(event);
      if (i >= steps.length) clearInterval(interval);
    }, 600);
  }, [applyEvent]);

  return { send, simulateTask };
}
