export type AgentStatus = 'idle' | 'thinking' | 'editing' | 'running' | 'completed' | 'error';
export type ModelType = 'deepseek-v4-flash' | 'deepseek-v4-pro';

export interface Settings {
  model: ModelType;
  apiKeyConfigured: boolean;
  cacheEnabled: boolean;
  semanticCacheEnabled: boolean;
  contextCompressionEnabled: boolean;
  cacheHitRate: number;
  tokensSaved: number;
  costSaved: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  githubRepo?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokensInput?: number;
  tokensOutput?: number;
}

export interface FileChange {
  id: string;
  filePath: string;
  status: 'added' | 'modified' | 'deleted';
  diff: string;
}

export interface AgentTask {
  id: string;
  type: 'analysis' | 'file_read' | 'file_write' | 'diff' | 'github' | 'terminal' | 'complete';
  status: 'running' | 'success' | 'failed';
  message: string;
  filePath?: string;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  icon: string;
  installed: boolean;
  enabled: boolean;
}

export interface ChatStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  cacheHitRate: number;
}
