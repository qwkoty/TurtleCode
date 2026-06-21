import { create } from 'zustand';
import { Settings, Project, Message, Plugin, AgentStatus, ChatStats, ModelType } from '@/types';
import { defaultPlugins, defaultProjects } from '@/lib/mock-data';

interface AppState {
  settings: Settings;
  projects: Project[];
  currentProjectId: string;
  messages: Message[];
  plugins: Plugin[];
  agentStatus: AgentStatus;
  chatStats: ChatStats;
  sidebarOpen: boolean;

  setSettings: (settings: Partial<Settings>) => void;
  addMessage: (message: Message) => void;
  setAgentStatus: (status: AgentStatus) => void;
  updateChatStats: (stats: Partial<ChatStats>) => void;
  togglePlugin: (id: string) => void;
  installPlugin: (id: string) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    model: 'deepseek-v4-flash',
    apiKeyConfigured: false,
    cacheEnabled: true,
    semanticCacheEnabled: false,
    contextCompressionEnabled: false,
    cacheHitRate: 0,
    tokensSaved: 0,
    costSaved: 0,
  },
  projects: defaultProjects,
  currentProjectId: defaultProjects[0]?.id ?? '',
  messages: [],
  plugins: defaultPlugins,
  agentStatus: 'idle',
  chatStats: {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCost: 0,
    cacheHitRate: 0,
  },
  sidebarOpen: true,

  setSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setAgentStatus: (status) => set({ agentStatus: status }),

  updateChatStats: (stats) =>
    set((state) => ({
      chatStats: { ...state.chatStats, ...stats },
    })),

  togglePlugin: (id) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
    })),

  installPlugin: (id) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === id ? { ...p, installed: true, enabled: true } : p
      ),
    })),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
}));
