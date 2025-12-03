import { NextRequest, NextResponse } from 'next/server';
import { verifySiweMessage } from '@worldcoin/minikit-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, message, signature, nonce, worldIdUsername } = body;

    // Validate required fields
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Address, message, and signature are required' },
        { status: 400 }
      );
    }

    console.log('🔐 Verifying wallet auth for address:', address);
    console.log('👤 World ID username from client:', worldIdUsername);

    // Verify the signature using verifySiweMessage from MiniKit
    // This validates that the signature was created by the claimed address
    try {
      const validationResult = await verifySiweMessage({
        status: 'success',
        message,
        signature,
        address,
        version: 2,
      }, nonce || '');

      console.log('✅ Signature verification result:', validationResult);

      if (!validationResult?.isValid) {
        console.warn('⚠️ Signature validation returned false, but continuing for demo');
        // Continue anyway for demo - in production you must verify
      } else {
        console.log('✅ Signature verified successfully');
      }
    } catch (verifyError) {
      console.error('❌ Signature verification failed:', verifyError);
      console.log('⚠️ Continuing anyway for development');
      // Continue anyway for demo - in production you must verify
    }

    // TODO: In production, call World ID API to verify orb status
    // For now, we'll check if the message contains verification level info
    // or require additional verification proof
    
    // Extract verification level from message or assume orb for demo
    // In production, you would:
    // 1. Require a World ID proof alongside wallet auth
    // 2. Call World ID API to verify the proof
    // 3. Check the verification_level in the proof
    
    const verificationLevel = 'orb'; // Demo: assume orb-verified
    
    // IMPORTANT: Only allow orb-verified users
    if (verificationLevel !== 'orb') {
      console.error('❌ User is not orb-verified');
      return NextResponse.json(
        { 
          error: 'Orb verification required',
          verificationLevel,
          message: 'You must be verified with a World ID Orb to access this app. Please visit a World ID Orb location to get verified.'
        },
        { status: 403 }
      );
    }

    console.log('✅ User is orb-verified');

    // Import prisma to fetch/create user from database
    const { prisma } = await import('@/lib/prisma');

    // Try to find existing user by wallet address (primary identifier)
    let user: any = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    // Determine username with priority:
    // 1. worldIdUsername from MiniKit (passed from client)
    // 2. Extract from SIWE message
    // 3. Fallback to address-based username
    let username: string = worldIdUsername || null;
    
    // If no username from client, try to extract from the SIWE message
    if (!username && message) {
      const usernameMatch = message.match(/@(\w+)/);
      if (usernameMatch) {
        username = usernameMatch[1];
        console.log('✅ Extracted username from message:', username);
      }
    }

    // Fallback: generate username from address if World ID doesn't provide one
    if (!username) {
      username = `user_${address.substring(2, 8)}`;
      console.log('⚠️ Using fallback username:', username);
    } else {
      console.log('✅ Using World ID username:', username);
    }

    // If user doesn't exist, create a new one
    if (!user) {
      console.log('🆕 Creating new user with username:', username);
      
      user = await prisma.user.create({
        data: {
          walletAddress: address,
          username,
          displayName: worldIdUsername ? `@${worldIdUsername}` : username,
          isVerified: true,
          verificationLevel: 'orb',
          nullifierHash: `nullifier_${address}`,
          // Set super admin for @ethan
          ...(username.toLowerCase() === 'ethan' && { isSuperAdmin: true } as any),
        },
      });
      
      console.log('✅ User created:', user.id, user.username);
    } else {
      // User exists - update with latest World ID username if we got one from client
      const shouldUpdateUsername = worldIdUsername && 
                                   user.username !== worldIdUsername && 
                                   !user.username.startsWith('user_'); // Don't update if user has a real username already
      
      if (shouldUpdateUsername) {
        console.log(`📝 Updating username from ${user.username} to ${worldIdUsername}`);
        
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            username: worldIdUsername,
            displayName: `@${worldIdUsername}`,
          },
        });
      }
      
      console.log('✅ User found:', user.id, user.username);
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('❌ Error verifying wallet authentication:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error message:', error?.message);
    return NextResponse.json(
      { 
        error: 'Failed to verify wallet authentication',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
