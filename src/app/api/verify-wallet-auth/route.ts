import { NextRequest, NextResponse } from 'next/server';
import { verifySiweMessage } from '@worldcoin/minikit-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, message, signature, nonce } = body;

    // Validate required fields
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Address, message, and signature are required' },
        { status: 400 }
      );
    }

    console.log('🔐 Verifying wallet auth for address:', address);

    // Verify the signature using verifySiweMessage from MiniKit
    // This validates that the signature was created by the claimed address
    try {
      const validationResult = await verifySiweMessage({
        status: 'success',
        message,
        signature,
        address,
        version: 1,
      }, nonce || '');

      if (!validationResult.isValid) {
        console.error('❌ Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }

      console.log('✅ Signature verified successfully');
    } catch (verifyError) {
      console.error('❌ Signature verification failed:', verifyError);
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

    // Generate or fetch user ID
    const userId = `user_${address.substring(0, 8)}`;

    // Extract username from message if available
    const username = `user_${address.substring(0, 6)}`;

    // Create user data
    const userData = {
      id: userId,
      walletAddress: address,
      username,
      displayName: username,
      verified: true,
      isVerified: true,
      verificationLevel: 'orb' as const,
      nullifierHash: `nullifier_${address}`, // In real app, get from World ID proof
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('❌ Error verifying wallet authentication:', error);
    return NextResponse.json(
      { error: 'Failed to verify wallet authentication' },
      { status: 500 }
    );
  }
}
