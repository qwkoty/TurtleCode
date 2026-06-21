import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model === 'deepseek-v4-pro' ? 'deepseek-chat' : 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content:
                  '你是 TurtleCode（乌龟码）的 AI Agent 小乌龟，一个专业的编程助手。请用中文回复，简洁明了，必要时给出代码示例。',
              },
              { role: 'user', content: message },
            ],
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({
          reply: data.choices?.[0]?.message?.content || '小乌龟没有理解，请再试一次。',
          cacheHit: false,
        });
      } catch (apiError) {
        console.error('DeepSeek API failed, falling back to mock:', apiError);
      }
    }

    // Fallback mock response for demo
    const mockReply = generateMockReply(message);
    return NextResponse.json({
      reply: mockReply,
      cacheHit: Math.random() > 0.7,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('登录') || lower.includes('login')) {
    return '好的，我来帮你新增登录功能。\n\n我会创建以下文件：\n- components/LoginForm.tsx\n- app/api/auth.ts\n\n并更新相关路由。请先确认项目当前使用的认证方案。';
  }
  if (lower.includes('博客') || lower.includes('blog')) {
    return '我来帮你开发一个博客系统。\n\n规划如下：\n1. 设计文章数据模型\n2. 创建文章列表页\n3. 创建文章详情页\n4. 添加后台管理功能\n\n需要我直接开始生成代码吗？';
  }
  if (lower.includes('优化') || lower.includes('速度')) {
    return '我来分析并优化首页速度。\n\n常见优化方向：\n- 图片懒加载与压缩\n- 代码分割\n- 减少第三方脚本\n- 启用缓存\n\n我先检查一下当前项目的构建产物和依赖。';
  }
  return `收到需求：${message}\n\n小乌龟正在分析项目结构，请稍候。你可以告诉我更具体的实现细节，比如技术栈、页面数量或是否需要接入数据库。`;
}
