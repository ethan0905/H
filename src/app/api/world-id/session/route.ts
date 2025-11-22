import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { verificationStorage } from '@/lib/verification-storage';

export async function POST(request: NextRequest) {
  try {
    const { app_id, action } = await request.json();

    if (!app_id || !action) {
      return NextResponse.json(
        { error: 'app_id and action are required' },
        { status: 400 }
      );
    }

    // Generate unique session ID
    const sessionId = randomBytes(32).toString('hex');
    
    // Store verification session
    verificationStorage.set(sessionId, {
      sessionId,
      app_id,
      action,
      status: 'pending',
      createdAt: Date.now(),
    });

    // Generate verification URL for World App
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${request.headers.get('host')}` 
      : 'http://localhost:3000';
    
    const callbackUrl = `${baseUrl}/api/world-id/callback?session=${sessionId}`;
    
    // World ID verification URL with proper callback
    const verificationUrl = `https://worldcoin.org/verify?` + new URLSearchParams({
      app_id,
      action,
      callback_url: callbackUrl,
    }).toString();

    return NextResponse.json({
      sessionId,
      verificationUrl,
      statusUrl: `${baseUrl}/api/world-id/status?session=${sessionId}`,
    });

  } catch (error) {
    console.error('Error creating verification session:', error);
    return NextResponse.json(
      { error: 'Failed to create verification session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = verificationStorage.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: session.status,
      proof: session.proof,
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
