import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    message: 'Debug endpoint working',
    env: process.env.NODE_ENV,
  });
}
