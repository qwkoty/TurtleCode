import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 'proj-1',
      name: 'turtlecode-web',
      description: 'TurtleCode 官方网站',
      githubRepo: 'turtlecode/turtlecode-web',
      createdAt: '2026-06-21',
    },
  ]);
}
