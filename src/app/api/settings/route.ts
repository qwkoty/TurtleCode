import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    model: 'deepseek-v4-flash',
    apiKeyConfigured: !!process.env.DEEPSEEK_API_KEY,
    cacheEnabled: true,
    semanticCacheEnabled: false,
    contextCompressionEnabled: false,
    cacheHitRate: 0,
    tokensSaved: 0,
    costSaved: 0,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ success: true, settings: body });
}
