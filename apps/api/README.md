# TurtleCode API

A mock NestJS backend for the TurtleCode AI Agent coding tool.

## Endpoints

- REST: `http://localhost:4000`
- WebSocket: `ws://localhost:4000`

### Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/config` | Get current model / API key / cache config |
| POST | `/config` | Update config |
| POST | `/config/test` | Validate the stored API key (mock) |
| GET | `/chats` | List chats |
| POST | `/chats` | Create a chat |
| GET | `/chats/:id/messages` | Get chat messages |
| GET | `/skills` | List default skills |
| GET | `/projects/:id/skills` | List installed skills for a project |
| POST | `/projects/:id/skills/:slug` | Install or update a skill |
| GET | `/projects/:id/stats` | Get token usage / cache hit stats |
| POST | `/github/connect` | Mock GitHub connect |
| GET | `/github/repos` | Mock GitHub repos |

### WebSocket events

- Listen for `chat:send` with `{ chatId?, projectId?, content }`
- Emits: `chat:created`, `chat:message`, `agent:status`, `agent:delta`, `agent:fileChange`, `agent:complete`, `agent:error`, `stats:update`

## Run

```bash
cd /workspace/apps/api
npm install
npm run start:dev
```

The server starts on port `4000` with CORS enabled for `http://localhost:3000`.

## Build

```bash
npm run build
```
