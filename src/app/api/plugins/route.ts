import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    plugins: [
      { id: 'plugin-github', name: 'GitHub', version: '1.0.0', category: '开发工具' },
      { id: 'plugin-docker', name: 'Docker', version: '1.0.0', category: '部署工具' },
    ],
  });
}
