# TurtleCode（乌龟码）开发文档

## 1. 文档信息

- **项目名称**：TurtleCode / 乌龟码
- **产品定位**：基于 DeepSeek V4 的 AI Agent 编程工具
- **核心理念**：聊天是核心，代码是结果
- **目标用户**：前端、后端、全栈开发者及技术团队
- **支持模型**：DeepSeek V4 Flash / DeepSeek V4 Pro
- **文档用途**：指导 TurtleCode 从 0 到 1 的三阶段产品开发

---

## 2. 项目概述

TurtleCode 不是传统意义上的代码编辑器，而是一个以 AI Agent 为核心的编程平台。用户通过自然语言与"小乌龟"对话，完成需求理解、项目分析、代码生成、代码修改、调试、文件管理、GitHub 操作及插件调用等开发任务。

### 2.1 产品目标

1. 打造 DeepSeek 深度优化的 AI Agent 编程平台
2. 实现 90% 以上的缓存命中率，显著降低 Token 与费用成本
3. 提供聊天式编程体验，让非专业用户也能完成复杂开发
4. 构建开放式插件生态，扩展 Agent 能力边界

### 2.2 核心设计原则

- **聊天优先**：聊天区为应用中最大区域，代码与文件为结果承载
- **Agent 自治**：小乌龟能够自主分析、拆解并执行多步骤任务
- **DeepSeek 原生**：从 Prompt 模板、缓存、上下文压缩到 Token 统计全面适配 DeepSeek
- **插件开放**：通过 Skills / MCP 机制支持第三方能力扩展

---

## 3. 技术架构总览

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端 | Next.js + TypeScript + TailwindCSS + Shadcn UI | 现代 React 全栈框架 |
| 代码编辑器 | Monaco Editor | 与 VS Code 同源，支持语法高亮与 Diff |
| 动画 | Framer Motion | 小乌龟状态动画、页面过渡、流光效果 |
| 后端 | NestJS + Node.js | 模块化、可扩展的服务端架构 |
| 数据库 | PostgreSQL | 用户、项目、对话、配置持久化 |
| 缓存 | Redis | Semantic Cache、Agent Memory、会话状态 |
| 实时通信 | WebSocket | 流式 AI 响应、Agent 执行状态推送 |
| 对象存储 | Cloudflare R2 | 文件、图片、插件资源存储 |
| 部署 | Render | 前后端统一部署 |
| 代码管理 | GitHub | 仓库连接、Commit、Push、Pull、分支管理 |

---

## 4. 三阶段路线图总览

| 阶段 | 主题 | 周期建议 | 核心目标 |
|------|------|----------|----------|
| Phase 1 | 基础平台与 AI 对话 | 4-5 周 | 完成账号/项目/Settings/AI 聊天基础能力，跑通 DeepSeek 对话闭环 |
| Phase 2 | Agent 工作台与 GitHub 工作流 | 5-6 周 | 完成 Workspace 三栏布局、Agent 代码编辑、GitHub 集成、文件管理 |
| Phase 3 | 插件生态与系统优化 | 4-5 周 | 完成 Skills 中心、MCP 插件体系、缓存优化、部署上线 |

---

## 5. Phase 1：基础平台与 AI 对话

### 5.1 阶段目标

搭建 TurtleCode 最小可用产品（MVP），实现用户通过 Settings 配置 DeepSeek API 后，在 Workspace 与小乌龟进行自然语言对话，并获得代码回复。

### 5.2 核心交付物

- 用户系统（注册/登录/会话管理）
- Settings 页面（模型/API/缓存配置）
- Workspace 基础聊天界面
- DeepSeek API 接入与流式响应
- 小乌龟 IP 基础状态动画
- 项目与对话数据持久化

### 5.3 功能范围

#### 5.3.1 用户与项目模型

- 用户注册/登录（邮箱 + OAuth，GitHub OAuth 优先）
- 工作区（Workspace）概念：一个用户可拥有多个项目
- 项目（Project）：绑定本地/远程代码目录、GitHub 仓库
- 会话（Conversation）：项目内的多轮对话记录

#### 5.3.2 Settings 页面

Settings 为 TurtleCode 的三个核心页面之一，用于配置 AI 与系统参数。

**页面布局**：

- 左侧：配置分类导航
- 右侧：具体配置项
- 右上角：动态小乌龟（待机/思考状态）

**配置项**：

| 分类 | 配置项 | 说明 |
|------|--------|------|
| 模型 | DeepSeek V4 Flash | 响应快、成本低，默认选项 |
| 模型 | DeepSeek V4 Pro | 强推理、长上下文 |
| API | API Key 输入 | 支持用户自有 Key 或平台托管 Key |
| API | 测试连接 | 一键验证 API Key 可用性 |
| 缓存 | 启用缓存 | Redis 基础缓存开关 |
| 缓存 | 启用语义缓存 | Semantic Cache 开关 |
| 缓存 | 启用上下文压缩 | 长上下文压缩开关 |
| 统计 | 缓存命中率 | 实时显示 |
| 统计 | Token 节省 | 累计统计 |
| 统计 | 费用节省 | 基于 DeepSeek 官方定价估算 |

#### 5.3.3 Workspace 基础聊天

- 三栏布局雏形：左侧 70% 聊天区，右侧 30% 预留 Agent 工作区
- 聊天顶部显示：TurtleCode Logo、当前模型、当前项目
- 聊天记录：用户消息、AI 回复、系统提示
- 输入框支持文字、代码片段、文件上传、图片上传
- 实时 Token 统计：当前输入 Token、当前输出 Token、总 Token、预计费用、缓存命中率

#### 5.3.4 DeepSeek 接入

- 统一 DeepSeek SDK 封装
- 支持 V4 Flash / V4 Pro 模型切换
- 流式 SSE/WebSocket 响应
- 基础 Prompt 模板化（系统 Prompt + 用户上下文 + 当前文件）
- Token 使用统计与费用估算

#### 5.3.5 小乌龟 IP 动画

实现基础状态动画：

- 待机：缓慢爬行
- 思考：探头观察
- 完成任务：开心挥手 + 任务完成 ✓

### 5.4 技术实现

#### 5.4.1 后端模块（NestJS）

```
src/
├── auth/              # 认证与授权
├── users/             # 用户管理
├── projects/          # 项目管理
├── conversations/     # 会话与消息
├── deepseek/          # DeepSeek API 封装
├── settings/          # 用户配置
├── cache/             # Redis 缓存封装
└── websocket/         # WebSocket 网关
```

#### 5.4.2 数据库 Schema（核心表）

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  github_id VARCHAR(100),
  name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  local_path TEXT,
  github_repo TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 会话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255),
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL, -- user / assistant / system
  content TEXT NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost DECIMAL(10,6),
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户设置表
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  model VARCHAR(50) DEFAULT 'deepseek-v4-flash',
  api_key_encrypted TEXT,
  cache_enabled BOOLEAN DEFAULT TRUE,
  semantic_cache_enabled BOOLEAN DEFAULT FALSE,
  context_compression_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.4.3 DeepSeek 请求流程

```
用户输入
  ↓
Prompt 模板组装（系统 Prompt + 项目上下文 + 历史消息）
  ↓
Semantic Cache 查询（如启用）
  ↓
命中 → 直接返回缓存结果
未命中 → 调用 DeepSeek API
  ↓
流式返回 Token
  ↓
统计 Token/费用/缓存
  ↓
持久化消息记录
```

### 5.5 里程碑

| 周次 | 里程碑 | 验收标准 |
|------|--------|----------|
| W1 | 项目初始化与用户系统 | 完成前后端脚手架，用户可注册登录 |
| W2 | Settings 页面 | 可配置模型、API Key、缓存选项，测试连接可用 |
| W3 | Workspace 聊天界面 | 三栏布局完成，消息可发送与显示 |
| W4 | DeepSeek 接入与流式响应 | 可切换模型，流式返回内容，Token 统计准确 |
| W5 | 数据持久化与动画 | 消息/配置持久化，小乌龟基础动画上线 |

### 5.6 验收标准

- 用户可在 Settings 中保存 DeepSeek API Key 并通过连接测试
- 用户可在 Workspace 输入任意开发需求，小乌龟返回有效回复
- 流式响应延迟 < 1 秒（首 Token）
- 基础缓存功能运行正常，可显示命中率
- 所有对话记录可持久化并重新加载

### 5.7 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| DeepSeek API 稳定性 | 高 | 增加重试、降级提示、错误码映射 |
| API Key 安全存储 | 高 | 使用对称加密存储，前端不暴露明文 Key |
| 流式响应前端卡顿 | 中 | 使用虚拟列表、节流渲染 |

---

## 6. Phase 2：Agent 工作台与 GitHub 工作流

### 6.1 阶段目标

让 TurtleCode 从"聊天工具"进化为"AI Agent 编程平台"。实现 Agent 自动分析项目、修改文件、生成 Diff、调用 GitHub 工作流，并在 Workspace 右侧完整展示 Agent 执行过程。

### 6.2 核心交付物

- Agent 核心引擎（任务拆解、执行、状态管理）
- Workspace 完整三栏布局
- 文件系统操作（读取/创建/修改/删除）
- 代码 Diff 实时展示
- GitHub 集成（连接、拉取、Commit、Push、分支管理）
- 自动 Commit Message 生成
- 底部状态栏（模型/Token/缓存/GitHub/Agent 状态）

### 6.3 功能范围

#### 6.3.1 Agent 核心引擎

Agent 负责将用户自然语言需求转化为可执行的任务序列。

**能力**：

- 项目分析：读取项目结构、package.json、依赖、入口文件
- 任务拆解：将"开发一个博客系统"拆分为多个子任务
- 代码生成：创建新文件并写入代码
- 代码修改：基于 Diff 修改现有文件
- Bug 修复：分析错误日志，定位并修复问题
- 自动重构：批量重命名、提取函数、优化结构
- 自动文档：生成 README、注释、API 文档
- 自动测试：生成单元测试、集成测试

**执行模型**：

```
用户需求
  ↓
Agent 规划器（Planner）→ 生成任务列表
  ↓
Agent 执行器（Executor）→ 逐个执行任务
  ↓
工具调用（文件/GitHub/终端）
  ↓
结果汇总 → 返回给用户
```

**任务状态**：待执行 / 执行中 / 成功 / 失败 / 需要确认

#### 6.3.2 Workspace 完整布局

- **左侧 70%：AI 聊天区**
  - 顶部：TurtleCode、当前模型、当前项目
  - 中部：聊天记录，包含 Agent 执行过程（分析项目、创建文件、修改文件、运行任务、完成任务）
  - 底部：多模态输入框 + 实时 Token/费用/缓存统计
- **右侧 30%：Agent 工作区**
  - 当前正在编辑的文件列表
  - 文件修改过程与 Diff 变化
  - 新增代码（绿色）/ 删除代码（红色）
  - Agent 状态：思考中 / 编辑中 / 运行中 / 完成
- **底部状态栏**
  - 当前模型
  - Token 消耗
  - 缓存命中率
  - GitHub 状态
  - Agent 状态

#### 6.3.3 文件系统操作

Agent 可对项目文件进行读写：

- 读取文件内容（read_file）
- 创建新文件（create_file）
- 修改文件内容（apply_diff / write_file）
- 删除文件（delete_file）
- 列出目录结构（list_directory）
- 搜索文件内容（search_code）

**安全机制**：

- 所有文件操作在沙箱项目目录内进行
- 关键操作（删除、覆盖）需要用户确认
- 操作前自动备份原文件

#### 6.3.4 Diff 展示

- 使用 Monaco Editor Diff View 展示变更
- 支持 side-by-side 与 inline 两种模式
- 实时同步 Agent 编辑过程
- 用户可接受/拒绝/回滚单次修改

#### 6.3.5 GitHub 集成

- 连接 GitHub 账号（OAuth）
- 拉取代码（Pull）
- 创建仓库（Create Repository）
- Commit：支持自动生成 Commit Message
- Push：自动 Push 到远程
- 分支管理：创建/切换/合并分支
- Pull Request：创建 PR（可选）

**工作流示例**：

```
用户：新增登录功能
Agent：
  1. 分析项目结构
  2. 创建 components/LoginForm.tsx
  3. 修改 api/auth.ts
  4. 运行测试
  5. 生成 Commit Message："feat: add login form and auth API"
  6. Commit 并 Push
```

### 6.4 技术实现

#### 6.4.1 Agent 架构

```
src/
├── agent/
│   ├── agent.service.ts        # Agent 主服务
│   ├── planner.service.ts      # 任务规划
│   ├── executor.service.ts     # 任务执行
│   ├── tool-registry.ts        # 工具注册表
│   └── tools/
│       ├── file-tool.ts        # 文件操作
│       ├── github-tool.ts      # GitHub 操作
│       ├── terminal-tool.ts    # 终端命令（沙箱）
│       └── search-tool.ts      # 代码搜索
```

#### 6.4.2 工具调用协议

每个工具统一实现：

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute(params: unknown, context: AgentContext): Promise<ToolResult>;
}

interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}
```

#### 6.4.3 Agent 执行状态同步

- 使用 WebSocket 向客户端推送 Agent 状态变更
- 每个任务包含 taskId、type、status、payload
- 客户端根据 taskId 更新右侧 Agent 工作区

```typescript
interface AgentTaskEvent {
  taskId: string;
  type: 'analysis' | 'file_read' | 'file_write' | 'diff' | 'github' | 'terminal' | 'complete';
  status: 'running' | 'success' | 'failed';
  payload: {
    filePath?: string;
    diff?: string;
    command?: string;
    message?: string;
  };
}
```

### 6.5 里程碑

| 周次 | 里程碑 | 验收标准 |
|------|--------|----------|
| W1 | Agent 规划器与执行器 | 能将用户需求拆分为任务并串行执行 |
| W2 | 文件操作工具 | Agent 可读取/创建/修改项目文件 |
| W3 | Workspace 右侧 Agent 区 | 实时显示编辑文件、Diff、Agent 状态 |
| W4 | GitHub OAuth 与基础操作 | 可连接账号、Pull、Commit、Push |
| W5 | 自动 Commit 与分支管理 | 自动生成 Commit Message，支持分支切换 |
| W6 | 测试与打磨 | 完成一个完整功能开发闭环测试 |

### 6.6 验收标准

- 用户输入"新增登录功能"，Agent 能独立完成文件创建、代码生成、Commit、Push
- Diff 展示准确，用户可接受/拒绝修改
- GitHub 状态在底部状态栏实时更新
- Agent 执行失败时给出明确原因与修复建议
- 所有文件操作均有审计日志

### 6.7 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| Agent 误操作破坏代码 | 高 | 沙箱隔离、操作前备份、关键操作需确认 |
| GitHub 权限管理复杂 | 中 | 最小权限原则，明确 Token 作用域 |
| 大项目上下文超出 Token 上限 | 高 | 上下文压缩、项目结构摘要、按需读取文件 |

---

## 7. Phase 3：插件生态与系统优化

### 7.1 阶段目标

构建 Skills 技能中心与插件市场，支持 MCP 协议扩展 Agent 能力；同时完成缓存优化、性能调优、部署上线，实现 90% 以上缓存命中率目标。

### 7.2 核心交付物

- Skills 技能中心页面
- 插件市场（卡片式布局、搜索、分类、排序）
- 默认插件：GitHub / Docker / Browser / Database / Linux Terminal / MCP / Figma / Deploy
- MCP 协议兼容层
- 缓存命中率优化至 ≥ 90%
- 部署到 Render 并开放公测

### 7.3 功能范围

#### 7.3.1 Skills 技能中心

Skills 是 TurtleCode 的第三个核心页面，用于管理 Agent 能力。

**布局**：

- 左侧：已安装插件 / 我的技能
- 右侧：插件市场

**已安装插件管理**：

- 显示插件列表（图标、名称、版本、状态）
- 支持启用 / 禁用 / 配置 / 删除 / 更新
- 点击插件进入配置界面

**插件市场**：

- 卡片式布局
- 显示插件图标、名称、简介、版本号、安装按钮
- 支持搜索、分类、排序
- 分类：开发工具、数据库、部署工具、设计工具、浏览器工具、Agent 工具、MCP 工具

#### 7.3.2 默认插件清单

| 插件 | 能力 | 配置项 |
|------|------|--------|
| GitHub | 仓库管理、代码同步、Commit 管理 | Token、仓库权限、同步设置 |
| Docker | 容器管理、镜像构建、部署项目 | 服务器地址、Docker 配置 |
| Browser | 网页访问、网页分析、网页抓取 | 无或代理配置 |
| Database | MySQL、PostgreSQL、SQLite、Redis | 连接字符串、凭证 |
| Linux Terminal | 命令执行、日志查看、进程管理 | 服务器地址、SSH 密钥 |
| MCP | 兼容 MCP 协议，扩展 Agent 能力 | MCP Server URL/配置 |
| Figma | 读取设计稿、生成页面、组件转换 | Figma Token、文件链接 |
| Deploy | 项目部署到 Render/Vercel/Netlify/Cloudflare | 平台 Token、项目配置 |

#### 7.3.3 插件架构

每个插件是一个独立包，遵循 TurtleCode Plugin SDK：

```typescript
interface TurtleCodePlugin {
  id: string;
  name: string;
  version: string;
  category: PluginCategory;
  tools: Tool[];
  configSchema: JSONSchema;
  activate(context: PluginContext): void;
  deactivate(): void;
}
```

#### 7.3.4 MCP 兼容层

- 支持 Model Context Protocol（MCP）Server
- 将 MCP Tool 转换为 TurtleCode 内部 Tool
- 支持 stdio 与 SSE 两种传输方式
- 动态发现 MCP Server 提供的工具

#### 7.3.5 DeepSeek 深度优化

**优化目标**：缓存命中率 ≥ 90%

**实现方案**：

| 优化项 | 说明 |
|--------|------|
| Prompt 模板化 | 固定系统 Prompt 与任务模板，提高重复查询命中率 |
| 上下文压缩 | 对历史消息与项目上下文进行摘要压缩，减少 Token |
| Semantic Cache | 基于向量相似度缓存语义等价的查询 |
| Redis Cache | 高频查询结果缓存，设置合理 TTL |
| Agent Memory | 持久化项目知识与用户偏好，减少重复推理 |
| Token 统计 | 精确统计输入/输出 Token |
| 费用统计 | 基于 DeepSeek 定价实时估算费用与节省 |

**缓存策略**：

```
用户请求
  ↓
语义缓存查询（Embedding 相似度）
  ↓
命中 → 返回缓存 + 标记 cache_hit
未命中 → Redis 精确缓存查询
  ↓
命中 → 返回缓存
未命中 → 调用 DeepSeek API
  ↓
结果写入语义缓存 + Redis 缓存
```

### 7.4 技术实现

#### 7.4.1 插件后端模块

```
src/
├── plugins/
│   ├── plugin-registry.service.ts
│   ├── plugin-marketplace.service.ts
│   ├── plugin-installer.service.ts
│   ├── mcp-adapter.service.ts
│   └── builtin/
│       ├── github/
│       ├── docker/
│       ├── browser/
│       ├── database/
│       ├── terminal/
│       └── figma/
```

#### 7.4.2 数据库 Schema 扩展

```sql
-- 插件表
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon_url TEXT,
  package_url TEXT,
  is_builtin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户插件安装表
CREATE TABLE user_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plugin_id UUID REFERENCES plugins(id),
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB,
  installed_at TIMESTAMP DEFAULT NOW()
);

-- Agent Memory 表
CREATE TABLE agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7.4.3 缓存命中率统计

```sql
-- 按日统计缓存命中率
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS total_requests,
  SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) AS cache_hits,
  ROUND(100.0 * SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) / COUNT(*), 2) AS hit_rate
FROM messages
GROUP BY DATE(created_at);
```

### 7.5 里程碑

| 周次 | 里程碑 | 验收标准 |
|------|--------|----------|
| W1 | Skills 页面与市场 UI | 三栏布局完成，插件卡片可展示 |
| W2 | 插件安装与配置 | 用户可安装、启用、配置插件 |
| W3 | 默认插件实现 | GitHub/Docker/Browser/Database/Terminal 插件可用 |
| W4 | MCP 协议兼容 | 可连接外部 MCP Server 并调用工具 |
| W5 | 缓存优化与部署 | 缓存命中率 ≥ 90%，完成 Render 部署 |

### 7.6 验收标准

- Skills 页面可浏览、搜索、安装插件
- GitHub/Docker/Browser/Database/Terminal 默认插件可正常调用
- MCP Server 可动态接入并扩展 Agent 工具
- 缓存命中率稳定 ≥ 90%
- 产品可在 Render 稳定运行并对外提供访问

### 7.7 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 插件安全隔离不足 | 高 | 插件在独立进程/Sandbox 中运行，限制权限 |
| MCP Server 质量参差不齐 | 中 | 提供白名单机制与版本锁定 |
| 缓存命中率不达目标 | 高 | 持续优化 Prompt 模板、增加 Embedding 覆盖、调整 TTL |
| 部署成本超预算 | 中 | 使用 Render 免费/低价套餐，配合缓存降低 API 费用 |

---

## 8. 跨阶段通用规范

### 8.1 代码规范

- 前端：ESLint + Prettier + TypeScript 严格模式
- 后端：NestJS 模块规范，接口使用 DTO 校验
- 提交信息：遵循 Conventional Commits

### 8.2 UI/UX 规范

- 设计语言：Glassmorphism 毛玻璃、圆角、柔和阴影、流光效果、深色模式
- 主色：`#2563EB`
- 辅助色：`#3B82F6`
- 强调色：`#06B6D4`
- 高亮色：`#22D3EE`
- 背景：深蓝黑渐变
- 动画：Framer Motion，页面淡入、按钮呼吸光效、代码生成动画、流光边框

### 8.3 安全规范

- API Key 加密存储，不在前端明文展示
- GitHub Token 使用最小权限原则
- 插件运行在受控沙箱中
- 所有对外接口进行身份认证与权限校验

### 8.4 测试规范

- 单元测试：Jest（后端）、Vitest（前端）
- E2E 测试：Playwright
- Agent 行为测试：定义标准任务集，定期回归

### 8.5 监控与日志

- 错误追踪：Sentry
- 性能监控：Render + Vercel Analytics（如适用）
- 日志：结构化日志，保留 30 天

---

## 9. 总体风险与依赖

| 风险/依赖 | 说明 | 缓解措施 |
|-----------|------|----------|
| DeepSeek API 变更 | 模型接口、定价、能力可能调整 | 封装统一 SDK，降低替换成本 |
| GitHub API 限流 | 高频操作可能触发限流 | 增加速率限制监控与队列 |
| 长上下文性能 | 大型项目上下文可能超出模型窗口 | 上下文压缩、摘要、按需加载 |
| 用户代码安全 | Agent 可能误删/误改用户代码 | 沙箱、备份、确认机制 |
| 插件生态质量 | 第三方插件可能不稳定或不安全 | 审核机制、版本锁定、权限隔离 |

---

## 10. 成功指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 缓存命中率 | ≥ 90% | DeepSeek 优化核心目标 |
| 首 Token 延迟 | < 1s | 用户输入后首字符响应时间 |
| 完整任务闭环率 | ≥ 70% | 用户一次对话完成开发任务的比例 |
| GitHub 操作成功率 | ≥ 95% | Pull/Commit/Push 等操作成功率 |
| 插件市场插件数 | ≥ 8 | 默认插件 + 首批第三方插件 |
| 日活跃用户（DAU） | 内测期 ≥ 100 | 公测前验证产品价值 |

---

## 11. 附录

### 11.1 术语表

| 术语 | 说明 |
|------|------|
| Agent | 能够自主理解需求并执行任务的 AI 代理 |
| MCP | Model Context Protocol，模型上下文协议 |
| Semantic Cache | 基于语义相似度的缓存机制 |
| Diff | 代码变更差异 |
| Skill | TurtleCode 中的插件/能力单元 |

### 11.2 参考资源

- DeepSeek 官方文档
- NestJS 官方文档
- Next.js 官方文档
- Shadcn UI 组件库
- Monaco Editor API 文档
- Framer Motion 文档
