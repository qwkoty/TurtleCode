import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Model = "deepseek-v4-flash" | "deepseek-v4-pro";

export type AgentStatus = "idle" | "thinking" | "editing" | "plugin" | "complete";

export type AttachmentType = "text" | "code" | "file" | "image";

export interface Attachment {
  type: AttachmentType;
  name: string;
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  attachments?: Attachment[];
}

export interface AppConfig {
  model: Model;
  apiKey: string;
  enableCache: boolean;
  enableSemanticCache: boolean;
  enableContextCompression: boolean;
}

export interface Stats {
  cacheHitRate: number;
  tokensSaved: number;
  costSaved: number;
  tokenUsage: number;
  cost: number;
}

interface TurtleCodeStore extends AppConfig, Stats {
  messages: ChatMessage[];
  input: string;
  isStreaming: boolean;
  currentProject: string;
  currentFile: string | null;
  currentFileOriginal: string;
  currentFileModified: string;
  agentStatus: AgentStatus;
  logs: string[];
  setModel: (model: Model) => void;
  setApiKey: (apiKey: string) => void;
  setCache: (enabled: boolean) => void;
  setSemanticCache: (enabled: boolean) => void;
  setContextCompression: (enabled: boolean) => void;
  setInput: (input: string) => void;
  addMessage: (message: ChatMessage) => void;
  appendDelta: (delta: string) => void;
  setStreaming: (streaming: boolean) => void;
  setAgentStatus: (status: AgentStatus) => void;
  setCurrentFile: (file: string | null) => void;
  setCurrentFileChange: (file: string, original: string, modified: string) => void;
  addLog: (log: string) => void;
  updateStats: (patch: Partial<Stats>) => void;
  clearChat: () => void;
}

const initialStats: Stats = {
  cacheHitRate: 42,
  tokensSaved: 128_430,
  costSaved: 3.84,
  tokenUsage: 0,
  cost: 0,
};

export const useTurtleCodeStore = create<TurtleCodeStore>()(
  persist(
    (set) => ({
      model: "deepseek-v4-flash",
      apiKey: "",
      enableCache: true,
      enableSemanticCache: false,
      enableContextCompression: false,
      messages: [
        {
          id: "welcome",
          role: "agent",
          content:
            "你好，我是 TurtleCode 🐢。把你的需求发给我，我会像海龟一样稳健地完成代码任务。",
        },
      ],
      input: "",
      isStreaming: false,
      currentProject: "turtlecode-web",
      currentFile: null,
      currentFileOriginal: "// 原始代码\n",
      currentFileModified: "// 修改后的代码\n",
      agentStatus: "idle",
      logs: ["系统已就绪，等待指令..."],
      ...initialStats,
      setModel: (model) => set({ model }),
      setApiKey: (apiKey) => set({ apiKey }),
      setCache: (enableCache) => set({ enableCache }),
      setSemanticCache: (enableSemanticCache) => set({ enableSemanticCache }),
      setContextCompression: (enableContextCompression) =>
        set({ enableContextCompression }),
      setInput: (input) => set({ input }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      appendDelta: (delta) =>
        set((state) => {
          const last = state.messages[state.messages.length - 1];
          if (last && last.role === "agent") {
            const messages = [...state.messages];
            messages[messages.length - 1] = {
              ...last,
              content: last.content + delta,
            };
            return { messages };
          }
          return {
            messages: [
              ...state.messages,
              { id: crypto.randomUUID(), role: "agent", content: delta },
            ],
          };
        }),
      setStreaming: (isStreaming) => set({ isStreaming }),
      setAgentStatus: (agentStatus) => set({ agentStatus }),
      setCurrentFile: (currentFile) => set({ currentFile }),
      setCurrentFileChange: (currentFile, currentFileOriginal, currentFileModified) =>
        set({ currentFile, currentFileOriginal, currentFileModified }),
      addLog: (log) =>
        set((state) => ({
          logs: [`[${new Date().toLocaleTimeString()}] ${log}`, ...state.logs].slice(0, 120),
        })),
      updateStats: (patch) => set((state) => ({ ...state, ...patch })),
      clearChat: () =>
        set({
          messages: [],
          input: "",
          tokenUsage: 0,
          cost: 0,
          agentStatus: "idle",
        }),
    }),
    {
      name: "turtlecode-config",
      partialize: (state) => ({
        model: state.model,
        apiKey: state.apiKey,
        enableCache: state.enableCache,
        enableSemanticCache: state.enableSemanticCache,
        enableContextCompression: state.enableContextCompression,
      }),
    }
  )
);
