import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  const corsOrigin = process.env.WEB_CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : true,
    credentials: true,
  });

  // 手动配置静态文件服务，避免 @nestjs/serve-static 的 path-to-regexp 兼容问题
  const staticDir = join(__dirname, '../../../apps/web/dist');
  if (existsSync(staticDir)) {
    const expressApp = app.getHttpAdapter().getInstance() as express.Express;

    // 服务 Next.js 静态资源（_next、static）
    expressApp.use(
      '/_next',
      express.static(join(staticDir, '_next'), {
        immutable: true,
        maxAge: '1y',
      }),
    );
    expressApp.use(
      '/static',
      express.static(join(staticDir, 'static'), {
        immutable: true,
        maxAge: '1y',
      }),
    );

    // SPA 回退：所有非 API、非 socket.io 请求返回对应 HTML
    expressApp.use(
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.method !== 'GET') return next();
        const path = req.path;

        // 跳过 API 和 WebSocket 路径
        if (
          path.startsWith('/api') ||
          path.startsWith('/socket.io') ||
          path.startsWith('/_next') ||
          path.startsWith('/static')
        ) {
          return next();
        }

        // 优先匹配已生成的页面 HTML
        const pageNames = ['workspace', 'settings', 'skills'];
        const matchedPage = pageNames.find(
          (name) => path === `/${name}` || path.startsWith(`/${name}/`),
        );

        const targetFile = matchedPage
          ? join(staticDir, `${matchedPage}.html`)
          : join(staticDir, 'index.html');

        if (existsSync(targetFile)) {
          return res.sendFile(targetFile);
        }
        next();
      },
    );
  }

  await app.listen(port);
  console.log(`TurtleCode listening on port ${port}`);
}
void bootstrap();
