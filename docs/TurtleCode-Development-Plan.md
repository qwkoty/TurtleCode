# TurtleCode（乌龟码）开发文档

> 基于 DeepSeek V4 深度优化的 AI Agent 编程平台

---

## 1. 项目概述

### 1.1 产品定位

TurtleCode 是一款以 AI Agent 为核心的编程工具。用户通过聊天描述需求，Agent（小乌龟）完成理解、分析、编写、修改、调试、文件管理与 GitHub 协作等任务。

核心理念：**聊天是核心，代码是结果。**

### 1.2 核心目标

- 打造 DeepSeek 专属优化通道，缓存命中率目标 **≥ 90%**。
- 提供聊天式、文件修改可视化的开发体验。
- 支持开放式插件生态（Skills），覆盖 GitHub、Docker、Browser、Database、MCP、Figma、Deploy 等能力。
- 最终部署到 **Render**。

### 1.3 三个交付阶段

| 阶段 | 主题 | 核心产出 |
|------|------|----------|
| Phase 1 | 基础平台 | 前后端骨架、Settings、DeepSeek 接入、基础缓存与 Token 统计、可部署到 Render |
| Phase 2 | AI 工作台 | Workspace 聊天界面、Agent 工作流、文件 Diff、GitHub 集成 |
| Phase 3 | 技能中心与上线 | Skills 插件市场、默认插件、动画打磨、Render 生产部署 |

---

## 2. 技术栈

### 2.1 前端

- **框架**：Next.js 14+（App Router）
- **语言**：TypeScript
- **样式**：TailwindCSS
- **组件库**：Shadcn UI
- **代码编辑器**：Monaco Editor（Diff 视图展示代码变更）
- **动画**：Framer Motion + CSS 动画
- **状态管理**：Zustand
- **数据请求**：TanStack Query（React Query）+ Axios
- **实时通信**：原生 WebSocket / Socket.IO Client

### 2.2 后端

- **框架**：NestJS 10+
- **运行时**：Node.js 20+
- **ORM**：Prisma
- **数据库**：PostgreSQL
- **缓存**：Redis
- **AI 调用**：DeepSeek REST API / 官方 SDK
- **实时通信**：WebSocket（NestJS 内置 `@nestjs/websockets`）
- **对象存储**：Cloudflare R2（图片、附件、导出文件）
- **部署目标**：Render

---

## 3. 系统架构

```text
┌─────────────────────────────────────────────────────────────┐
│                        前端 (Next.js)                        │
│  /settings  │  /workspace  │  /skills                        │
└───────────────────────┬─────────────────────────────────────┘
                        │  REST / WebSocket
┌───────────────────────▼─────────────────────────────────────┐
│                       后端 (NestJS)                          │
│  Auth  │  Config  │  Chat  │  Agent  │  GitHub  │  Skills   │
│  Cache  │  Storage  │  Billing  │  WebSocket Gateway         │
└───────┬───────────────┬───────────────┬───────────────────────┘
        │               │               │
   PostgreSQL      Redis          DeepSeek API
        │               │               │
   Cloudflare R2   GitHub API      Plugin Adapters
```

### 3.1 核心模块职责

- **Config**：模型选择、API Key、缓存开关、上下文压缩开关。
- **Chat**：会话管理、消息持久化、附件上传。
- **Agent**：接收用户意图、拆解任务、调用 DeepSeek、执行文件操作、调用插件。
- **GitHub**：仓库连接、Pull、Commit、Push、分支管理、自动生成 Commit Message。
- **Skills**：插件安装、启用、配置、运行时调用。
- **Cache**：Redis 缓存、语义缓存、命中率统计。
- **Billing**：Token 统计、费用估算、缓存节省计算。
- **Storage**：Cloudflare R2 文件上传与临时文件存储。

---

## 4. 数据库设计（Prisma 示例）

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id          String   @id @default(uuid())
  name        String
  repoUrl     String?
  githubToken String?  // 加密存储
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  apiConfig   ApiConfig?
  chats       Chat[]
  skills      ProjectSkill[]
  tokenUsages TokenUsage[]
}

model ApiConfig {
  id                     String  @id @default(uuid())
  projectId              String  @unique
  project                Project @relation(fields: [projectId], references: [id])

  model                  String  // "deepseek-v4-flash" | "deepseek-v4-pro"
  apiKeyHash             String? // 加密后的 API Key

  cacheEnabled           Boolean @default(true)
  semanticCacheEnabled   Boolean @default(true)
  compressionEnabled     Boolean @default(true)
}

model Chat {
  id        String    @id @default(uuid())
  projectId String
  project   Project   @relation(fields: [projectId], references: [id])
  title     String?
  model     String
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id           String   @id @default(uuid())
  chatId       String
  chat         Chat     @relation(fields: [chatId], references: [id])

  role         String   // "user" | "assistant" | "agent"
  content      String   @db.Text
  attachments  Json?    // [{ type, url, name }]

  inputTokens  Int      @default(0)
  outputTokens Int      @default(0)
  costCents    Int      @default(0) // 美分 * 10000，避免浮点
  cacheHit     Boolean  @default(false)

  executions   AgentExecution[]
  createdAt    DateTime @default(now())
}

model AgentExecution {
  id          String       @id @default(uuid())
  messageId   String
  message     Message      @relation(fields: [messageId], references: [id])

  status      String       // "thinking" | "editing" | "running" | "done" | "error"
  type        String       // "analyze" | "create_file" | "edit_file" | "run_task" | "complete"
  description String
  fileChanges FileChange[]
  createdAt   DateTime     @default(now())
}

model FileChange {
  id          String         @id @default(uuid())
  executionId String
  execution   AgentExecution @relation(fields: [executionId], references: [id])

  filePath    String
  before      String?        @db.Text
  after       String?        @db.Text
  status      String         // "added" | "modified" | "deleted"
}

model Skill {
  id            String         @id @default(uuid())
  slug          String         @unique
  name          String
  category      String         // "dev" | "database" | "deploy" | "design" | "browser" | "agent" | "mcp"
  version       String
  description   String
  configSchema  Json
  iconUrl       String?

  projectSkills ProjectSkill[]
}

model ProjectSkill {
  id        String  @id @default(uuid())
  projectId String
  skillId   String
  project   Project @relation(fields: [projectId], references: [id])
  skill     Skill   @relation(fields: [skillId], references: [id])

  enabled   Boolean @default(true)
  config    Json?

  @@unique([projectId, skillId])
}

model TokenUsage {
  id           String   @id @default(uuid())
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id])
  date         DateTime @default(now())
  model        String
  inputTokens  Int      @default(0)
  outputTokens Int      @default(0)
  cacheHits    Int      @default(0)
  costCents    Int      @default(0)
}
```

---

## 5. 关键 API 与 WebSocket 设计

### 5.1 REST 接口

| 分组 | 路径 | 说明 |
|------|------|------|
| Config | `GET/POST /api/config` | 读取/保存 API 与模型配置 |
| Config | `POST /api/config/test` | 测试 DeepSeek API Key |
| Chat | `GET /api/chats` | 会话列表 |
| Chat | `POST /api/chats` | 新建会话 |
| Chat | `GET /api/chats/:id/messages` | 聊天记录 |
| Agent | `POST /api/agent/run` | 同步触发 Agent（可选） |
| Skills | `GET /api/skills` | 插件市场列表 |
| Skills | `GET /api/projects/:id/skills` | 项目已安装插件 |
| Skills | `POST /api/projects/:id/skills/:slug` | 安装/更新插件配置 |
| GitHub | `POST /api/github/connect` | 保存 GitHub Token |
| GitHub | `GET /api/github/repos` | 仓库列表 |
| GitHub | `POST /api/github/commit` | 提交变更 |
| GitHub | `POST /api/github/push` | Push 代码 |
| Billing | `GET /api/projects/:id/stats` | Token、费用、缓存命中率 |

### 5.2 WebSocket 事件

| 方向 | 事件 | 说明 |
|------|------|------|
| 客户端 -> 服务端 | `chat:send` | 发送消息 |
| 服务端 -> 客户端 | `agent:status` | Agent 状态变更 |
| 服务端 -> 客户端 | `agent:fileChange` | 文件变更（含 diff） |
| 服务端 -> 客户端 | `agent:delta` | AI 回复流式片段 |
| 服务端 -> 客户端 | `agent:complete` | 任务完成 |
| 服务端 -> 客户端 | `stats:update` | 实时 Token / 缓存统计 |

---

## 6. 前端结构

```text
apps/web/
├── app/
│   ├── layout.tsx              # 全局布局 + WebSocket 连接
│   ├── page.tsx                # 默认重定向到 /workspace
│   ├── settings/page.tsx       # Settings 页面
│   ├── workspace/page.tsx      # Workspace 页面
│   └── skills/page.tsx         # Skills 页面
├── components/
│   ├── turtle-avatar.tsx       # 小乌龟动态组件
│   ├── chat/
│   │   ├── chat-input.tsx      # 输入框 + 附件 + 实时统计
│   │   ├── chat-message.tsx    # 消息气泡
│   │   └── chat-history.tsx    # 聊天记录列表
│   ├── agent/
│   │   ├── agent-status.tsx    # 右侧 Agent 状态
│   │   ├── file-diff.tsx       # Monaco Diff 视图
│   │   └── execution-log.tsx   # 执行过程
│   ├── settings/
│   │   ├── model-selector.tsx
│   │   ├── api-key-form.tsx
│   │   └── cache-config.tsx
│   └── skills/
│       ├── skill-card.tsx
│       └── skill-config-drawer.tsx
├── hooks/
│   ├── use-websocket.ts
│   └── use-agent.ts
├── lib/
│   ├── api.ts                  # REST 客户端
│   └── utils.ts
└── stores/
    ├── config-store.ts
    └── chat-store.ts
```

---

## 7. 缓存与 Token 优化策略

目标：缓存命中率 **≥ 90%**。

1. **Prompt 模板化**
   - 系统提示、角色提示、项目上下文固定为模板，生成稳定哈希作为缓存键。
   - 模板参数顺序固定，避免无关改动导致缓存失效。

2. **上下文压缩**
   - 对历史对话做摘要，保留关键决策与文件状态。
   - 仅将相关文件摘要送入模型，避免一次性全量项目上下文。

3. **Redis 精确缓存**
   - 缓存键 = `hash(model + temperature + prompt)`。
   - 缓存值 = 完整响应 + Token 统计。
   - 设置 TTL，按模型和项目维度独立配置。

4. **Semantic Cache（语义缓存）**
   - 使用文本嵌入（本地小模型或 DeepSeek Embedding）计算用户提问与历史问题的相似度。
   - 命中阈值以上时直接返回历史结果，命中计入缓存统计。
   - Redis 中存储 `embedding -> response` 映射，可结合 RedisJSON / vector 索引或 pgvector。

5. **Agent Memory**
   - 记录每个项目的关键决策、文件关系、常见错误，形成长期记忆。
   - 在后续请求中优先注入记忆，减少重复推理。

6. **统计与费用**
   - 每次请求记录 input/output tokens、缓存命中、预计费用。
   - 在输入框、Settings、底部状态栏实时展示。

---

## 8. AI Agent 工作流

```text
用户输入
   │
   ▼
意图识别（DeepSeek V4 Flash）
   │
   ▼
项目上下文加载（文件树、记忆、Skills）
   │
   ▼
任务拆解 → 生成执行计划
   │
   ▼
循环执行：
  ├─ 分析项目
  ├─ 创建/修改文件（生成 Diff）
  ├─ 调用插件（GitHub、Docker、Browser...）
  ├─ 运行测试/命令
  └─ 验证结果
   │
   ▼
汇总结果 → 推送到前端 → 保存到数据库
```

- **小乌龟状态机**：待机、思考、编辑代码、调用插件、完成任务。
- **Diff 生成**：Agent 输出统一结构化格式（JSON Patch / 类 Git diff），后端落盘后通过 Monaco Diff 渲染。
- **插件调用**：Agent 通过 Skills Registry 查找可用插件，按 manifest 调用并回传结果。

---

## 9. GitHub 集成

- 用户在 Settings 或 Workspace 中输入 GitHub Personal Access Token。
- 后端通过 `@octokit/rest` 与 GitHub API 交互。
- 支持功能：
  - 拉取仓库列表
  - 拉取代码（`git clone` / `git pull`）
  - 创建仓库
  - 自动生成 Commit Message
  - Commit & Push
  - 分支切换与创建
- 代码修改先在本地工作区执行，确认后再由用户触发或 Agent 自动 Commit/Push。

---

## 10. 插件系统（Skills）

### 10.1 默认插件清单

| 插件 | 能力 |
|------|------|
| GitHub | 仓库、同步、Commit、Push、分支 |
| Docker | 容器管理、镜像构建、部署 |
| Browser | 网页访问、分析、抓取 |
| Database | MySQL、PostgreSQL、SQLite、Redis 查询 |
| Linux Terminal | 命令执行、日志、进程管理 |
| MCP | 兼容 Model Context Protocol，扩展 Agent |
| Figma | 读取设计稿、生成页面、组件转换 |
| Deploy | 部署到 Render、Vercel、Netlify、Cloudflare |

### 10.2 插件运行时架构

```text
Skill Manifest (JSON)
   │
   ▼
Skill Adapter (Node.js 模块 / Docker 容器 / MCP Server)
   │
   ▼
Agent Service 调用 → 返回结构化结果
```

- 每个插件包含 `manifest.json`：名称、版本、配置字段、接口定义、权限声明。
- 插件安装后将配置写入 `ProjectSkill`，运行时通过统一接口调用。

---

## 11. 三阶段实施路线

### Phase 1：基础平台与 Settings

**目标**：让前后端跑起来，能配置 DeepSeek，完成首次 API 调用，并部署到 Render。

**后端任务**：
- 初始化 NestJS 项目，配置 Prisma + PostgreSQL。
- 配置 Redis 连接（ioredis）。
- 实现 `ConfigModule`：模型选择、API Key 测试与保存、缓存开关。
- 封装 DeepSeek 客户端，支持流式响应。
- 实现基础缓存层（Redis 精确缓存 + 语义缓存雏形）。
- 实现 Token / 费用统计模块。
- 实现 WebSocket Gateway，支持 `chat:send` 与 `agent:delta`。
- 实现 Cloudflare R2 上传接口（头像、附件）。

**前端任务**：
- 初始化 Next.js + TailwindCSS + Shadcn UI。
- 完成全局布局、深色主题、品牌色配置。
- 实现 `Settings` 页面：
  - 模型选择（Flash / Pro）
  - API Key 输入与测试连接
  - 缓存、语义缓存、上下文压缩开关
  - 缓存命中率、Token 节省、费用节省展示
- 实现小乌龟待机/思考状态动画。
- 接入 WebSocket 与 REST。

**部署任务**：
- 在 Render 创建 Web Service 跑 NestJS。
- 创建 Managed PostgreSQL 与 Redis（Redis Cloud 或 Render 支持的 Redis）。
- 前端以 Static Site 或 Next.js Web Service 形式部署到 Render。
- 配置环境变量（见第 13 节）。

**验收标准**：
- 打开 Settings 可保存 API Key 并测试连接成功。
- 选择模型后，系统能调用 DeepSeek 并返回流式回复。
- 缓存命中率统计可显示（初期可能偏低，架构就绪）。
- 应用可在 Render 公开访问。

---

### Phase 2：AI 工作台与 GitHub 集成

**目标**：完成 Workspace 聊天式编程、Agent 文件修改可视化、GitHub 工作流。

**后端任务**：
- 实现 `ChatModule` 与 `MessageModule`，持久化聊天记录。
- 实现 `AgentModule`：
  - 接收用户消息并解析意图。
  - 加载项目文件上下文。
  - 生成代码修改方案并输出结构化 Diff。
  - 通过 WebSocket 推送执行过程。
- 实现文件系统工作区（每个项目独立目录）。
- 实现 `GitHubModule`：Token 验证、仓库列表、Clone/Pull、Commit/Push、自动生成 Commit Message。
- 实现 Agent 状态机与执行日志。
- 接入 DeepSeek V4 Pro 用于复杂任务（多文件协同、架构设计）。

**前端任务**：
- 实现 `Workspace` 页面：
  - 左侧 70% AI 聊天区
  - 右侧 30% Agent 工作区
  - 顶部显示 TurtleCode / 当前模型 / 当前项目
  - 聊天记录支持文本、代码、文件、图片
  - 底部输入框带 Token 实时统计
- 实现 `FileDiff` 组件（Monaco Diff）。
- 实现 Agent 执行过程展示（分析、创建文件、修改文件、运行任务、完成任务）。
- 实现底部状态栏（模型、Token、缓存、GitHub、Agent 状态）。
- 实现小乌龟编辑代码、调用插件、完成任务动画。

**部署任务**：
- Render 后端增加文件系统持久化卷（Render Disk），用于项目工作区。
- 配置 GitHub OAuth / PAT 环境变量。
- WebSocket 在 Render 上启用（使用 HTTP Upgrade）。

**验收标准**：
- 用户输入“开发一个登录页面”，Agent 能分析并生成/修改多个文件。
- 前端右侧实时展示修改的文件与 Diff。
- 用户可一键 Commit/Push 到 GitHub。
- 小乌龟状态动画随 Agent 状态切换。

---

### Phase 3：技能中心、插件生态与生产上线

**目标**：完成 Skills 插件市场、默认插件、动画打磨、Render 生产部署。

**后端任务**：
- 实现 `SkillsModule`：
  - 插件市场数据（支持分类、搜索、排序）
  - 插件安装、启用、禁用、删除、更新
  - 插件配置持久化
- 实现默认插件适配器：GitHub、Docker、Browser、Database、Linux Terminal、MCP、Figma、Deploy。
- 实现插件调用沙箱与安全校验。
- 实现部署插件与 Render / Vercel / Netlify / Cloudflare API 的对接。
- 完善语义缓存与 Agent Memory，持续优化缓存命中率。
- 增加日志、错误监控、健康检查接口。

**前端任务**：
- 实现 `Skills` 页面：
  - 左侧“我的技能”列表
  - 右侧“插件市场”卡片网格
  - 搜索、分类、排序
  - 插件配置抽屉/弹窗
- 为每个插件提供配置表单（基于 JSON Schema 动态生成）。
- 小乌龟调用插件时背上显示对应技能图标。
- 页面淡入、按钮呼吸光效、流光边框、代码生成动画等细节打磨。

**部署任务**：
- Render 生产环境配置：
  - 关闭开发模式，开启生产构建。
  - 配置健康检查 `/health`。
  - 配置日志与监控（Render 原生日志 + 可选 Sentry）。
- 域名与 HTTPS（Render 自动提供）。
- 数据库迁移脚本自动化（`prisma migrate deploy` 作为 build/start 步骤）。
- 环境变量最终检查清单。

**验收标准**：
- Skills 页面可安装、启用、配置插件。
- Agent 能根据需求调用插件（如 Docker 构建、Browser 抓取）。
- 缓存命中率≥90%（上线后根据真实数据持续调优）。
- 整套系统稳定运行在 Render 上。

---

## 12. 关键目录与仓库结构建议

```text
turtlecode/
├── apps/
│   ├── web/                  # Next.js 前端
│   └── api/                  # NestJS 后端
├── packages/
│   ├── shared/               # 共享类型与常量
│   ├── ui/                   # 共享 UI 组件（可选）
│   └── skills/               # 插件 SDK 与默认插件
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── prisma/
│   └── schema.prisma
├── render.yaml               # Render Blueprint
├── turbo.json                # 如果使用 Turborepo
└── package.json
```

---

## 13. Render 部署环境变量

| 变量 | 说明 | 阶段 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 | Phase 1 |
| `REDIS_URL` | Redis 连接串 | Phase 1 |
| `R2_ENDPOINT` | Cloudflare R2 S3 Endpoint | Phase 1 |
| `R2_ACCESS_KEY_ID` | R2 Access Key | Phase 1 |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key | Phase 1 |
| `R2_BUCKET_NAME` | R2 Bucket 名称 | Phase 1 |
| `DEEPSEEK_API_KEY` | DeepSeek 主 API Key（ fallback 用） | Phase 1 |
| `GITHUB_CLIENT_ID` | GitHub OAuth App ID | Phase 2 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | Phase 2 |
| `GITHUB_WEBHOOK_SECRET` | GitHub Webhook 密钥（可选） | Phase 2 |
| `RENDER_API_KEY` | Render Deploy 插件用 | Phase 3 |
| `VERCEL_TOKEN` | Vercel Deploy 插件用 | Phase 3 |
| `NETLIFY_TOKEN` | Netlify Deploy 插件用 | Phase 3 |
| `FIGMA_ACCESS_TOKEN` | Figma 插件用 | Phase 3 |
| `JWT_SECRET` | 会话/鉴权密钥 | Phase 2+ |
| `WEBSOCKET_CORS_ORIGIN` | WebSocket 跨域白名单 | Phase 2 |

---

## 14. Render 部署步骤

1. 在 Render 创建 **Managed PostgreSQL**，复制 `DATABASE_URL`。
2. 创建 Redis 实例（Render 原生 Redis 或 Redis Cloud），复制 `REDIS_URL`。
3. 创建 Cloudflare R2 Bucket，获取 S3 兼容凭证。
4. 在 GitHub 创建 OAuth App，获取 Client ID / Secret。
5. 后端：创建 Render Web Service，选择 Node，构建命令 `npm install && npm run build:api`，启动命令 `npm run start:api`，挂载 Render Disk 到 `/data/projects`。
6. 前端：创建 Render Static Site 或 Next.js Web Service，构建命令 `npm install && npm run build:web`，输出目录 `apps/web/.next`（Static Site 需导出）。
7. 配置环境变量（第 13 节）。
8. 添加 `render.yaml` Blueprint（可选），实现一键部署。
9. 首次部署后运行 `npx prisma migrate deploy` 初始化数据库。
10. 配置健康检查 `/health` 与日志监控。

---

## 15. 测试与验收

### 15.1 测试类型

- **单元测试**：NestJS 服务、工具函数、缓存策略。
- **集成测试**：DeepSeek API 调用、GitHub API 调用、数据库读写、WebSocket 事件。
- **E2E 测试**：使用 Playwright 覆盖 Settings、Workspace、Skills 核心路径。
- **性能测试**：模拟并发对话，验证缓存命中率与响应延迟。

### 15.2 核心验收用例

1. 用户在 Workspace 输入“生成一个 React 计数器组件”，Agent 创建文件并在右侧展示 Diff。
2. 用户点击“提交到 GitHub”，系统生成 Commit Message 并成功 Push。
3. 在 Skills 安装 Docker 插件并配置后，Agent 能执行 `docker build`。
4. Settings 页面切换模型后，后续请求使用对应 DeepSeek 模型。
5. 连续询问同类问题，缓存命中率≥90%。

---

## 16. 风险与依赖

| 风险 | 缓解方案 |
|------|----------|
| DeepSeek API 延迟或不可用 | 实现流式响应、降级提示、请求队列与重试 |
| GitHub Token 安全 | 加密存储、最小权限、不记录日志 |
| 缓存命中率不达预期 | Prompt 模板化、语义缓存、Agent Memory 持续迭代 |
| 插件安全 | 沙箱执行、权限声明、审计日志 |
| 大项目上下文超长 | 上下文压缩、文件摘要、按需加载 |

---

## 17. 品牌与设计速查

| 项目 | 值 |
|------|-----|
| 主色 | `#2563EB` |
| 辅助色 | `#3B82F6` |
| 强调色 | `#06B6D4` |
| 高亮色 | `#22D3EE` |
| 风格 | Glassmorphism、深色模式、圆角、柔和阴影、流光边框 |
| IP 状态 | 待机（爬行）、思考（探头）、编辑（戴头盔敲代码）、调用插件（背技能图标）、完成（挥手） |

---

## 18. 下一步行动

1. 确认本开发文档后，初始化 `apps/web` 与 `apps/api` 两个项目。
2. 配置 Render Blueprint（`render.yaml`）与数据库迁移脚本。
3. 从 Phase 1 开始迭代：先完成 Settings 页面与 DeepSeek 基础调用。
