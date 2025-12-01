import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate a cryptographically secure random nonce
    const nonce = randomBytes(32).toString('hex');
    
    // In a real implementation, you would:
    // 1. Store the nonce in a database with an expiration time
    // 2. Associate it with the user's session
    // 3. Validate it when the signed message is received

    return NextResponse.json({
      nonce,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Generate a cryptographically secure random nonce
    const nonce = randomBytes(32).toString('hex');
    
    return NextResponse.json({
      nonce,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
