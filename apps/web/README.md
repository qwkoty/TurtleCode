# TurtleCode Web

TurtleCode 前端应用，基于 Next.js 14 App Router + TypeScript + TailwindCSS 构建。

## 开始

在项目根目录或本目录下安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

默认在 [http://localhost:3000](http://localhost:3000) 打开。

## 构建

```bash
npm run build
```

## 项目结构

- `app/` — 页面路由
- `components/` — 可复用组件（如像素海龟头像、Diff 查看器）
- `lib/` — Zustand Store 与 WebSocket Hook
- `app/globals.css` — 全局样式与玻璃拟态主题

## 后端连接

工作区默认尝试连接 `ws://localhost:4000`，若后端未运行会自动切换到模拟演示模式。
