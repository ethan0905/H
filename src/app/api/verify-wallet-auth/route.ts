import { NextRequest, NextResponse } from 'next/server';
import { verifySiweMessage } from '@worldcoin/minikit-js';

export async function POST(request: NextRequest) {
  console.log('🚀 [VERIFY-WALLET-AUTH] Starting wallet authentication...');
  
  try {
    console.log('📥 [STEP 1] Parsing request body...');
    const body = await request.json();
    console.log('📥 [STEP 1] Received body keys:', Object.keys(body));
    console.log('📥 [STEP 1] Full body:', JSON.stringify(body, null, 2));
    
    console.log('🔍 [STEP 2] Extracting payload data...');
    // Support both payload format and direct parameters
    const payload = body.payload || body;
    console.log('🔍 [STEP 2] Payload keys:', Object.keys(payload));
    console.log('🔍 [STEP 2] Payload:', JSON.stringify(payload, null, 2));
    
    const { address, message, signature } = payload;
    const nonce = body.nonce || payload.nonce;
    const worldIdUsername = body.worldIdUsername || payload.worldIdUsername;

    console.log('✅ [STEP 2] Extracted values:', {
      address: address ? `${address.substring(0, 10)}...` : 'MISSING',
      message: message ? `${message.substring(0, 50)}...` : 'MISSING',
      signature: signature ? `${signature.substring(0, 20)}...` : 'MISSING',
      nonce: nonce ? 'Present' : 'MISSING',
      worldIdUsername: worldIdUsername || 'Not provided'
    });

    // Validate required fields
    if (!address || !message || !signature) {
      console.error('❌ [VALIDATION FAILED] Missing required fields:', { 
        address: !!address, 
        message: !!message, 
        signature: !!signature 
      });
      return NextResponse.json(
        { error: 'Address, message, and signature are required' },
        { status: 400 }
      );
    }

    console.log('✅ [STEP 3] Validation passed');
    console.log('🔐 [STEP 4] Verifying wallet auth for address:', address);
    console.log('👤 [STEP 4] World ID username from client:', worldIdUsername);

    // Verify the signature using verifySiweMessage from MiniKit
    // This validates that the signature was created by the claimed address
    console.log('🔐 [STEP 5] Starting signature verification...');
    try {
      console.log('🔐 [STEP 5] Calling verifySiweMessage with version 2...');
      const validationResult = await verifySiweMessage({
        status: 'success',
        message,
        signature,
        address,
        version: 2,
      }, nonce || '');

      console.log('✅ [STEP 5] Signature verification result:', JSON.stringify(validationResult, null, 2));

      if (!validationResult?.isValid) {
        console.warn('⚠️ [STEP 5] Signature validation returned false, but continuing for demo');
        // Continue anyway for demo - in production you must verify
      } else {
        console.log('✅ [STEP 5] Signature verified successfully');
      }
    } catch (verifyError: any) {
      console.error('❌ [STEP 5] Signature verification failed:', verifyError);
      console.error('❌ [STEP 5] Error message:', verifyError?.message);
      console.error('❌ [STEP 5] Error stack:', verifyError?.stack);
      console.log('⚠️ [STEP 5] Continuing anyway for development');
      // Continue anyway for demo - in production you must verify
    }

    console.log('🔍 [STEP 6] Checking verification level...');
    // TODO: In production, call World ID API to verify orb status
    // For now, we'll check if the message contains verification level info
    // or require additional verification proof
    
    // Extract verification level from message or assume orb for demo
    // In production, you would:
    // 1. Require a World ID proof alongside wallet auth
    // 2. Call World ID API to verify the proof
    // 3. Check the verification_level in the proof
    
    const verificationLevel = 'orb'; // Demo: assume orb-verified
    console.log('✅ [STEP 6] Verification level:', verificationLevel);
    
    // IMPORTANT: Only allow orb-verified users
    if (verificationLevel !== 'orb') {
      console.error('❌ [STEP 6] User is not orb-verified');
      return NextResponse.json(
        { 
          error: 'Orb verification required',
          verificationLevel,
          message: 'You must be verified with a World ID Orb to access this app. Please visit a World ID Orb location to get verified.'
        },
        { status: 403 }
      );
    }

    console.log('✅ [STEP 6] User is orb-verified');

    // Import prisma to fetch/create user from database
    console.log('📦 [STEP 7] Importing Prisma client...');
    const { prisma } = await import('@/lib/prisma');
    console.log('✅ [STEP 7] Prisma client imported successfully');

    // Try to find existing user by wallet address (primary identifier)
    console.log('🔍 [STEP 8] Searching for existing user by wallet address...');
    console.log('🔍 [STEP 8] Wallet address:', address);
    
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { walletAddress: address },
      });
      console.log('✅ [STEP 8] User search completed. Found:', user ? `User ID: ${user.id}` : 'No existing user');
    } catch (dbError: any) {
      console.error('❌ [STEP 8] Database query failed:', dbError);
      console.error('❌ [STEP 8] Error message:', dbError?.message);
      console.error('❌ [STEP 8] Error code:', dbError?.code);
      throw dbError;
    }

    console.log('🔤 [STEP 9] Determining username...');
    // Determine username with priority:
    // 1. worldIdUsername from MiniKit (passed from client)
    // 2. Extract from SIWE message
    // 3. Fallback to address-based username
    let username: string = worldIdUsername || null;
    console.log('🔤 [STEP 9] Username from client:', username);
    
    // If no username from client, try to extract from the SIWE message
    if (!username && message) {
      console.log('🔤 [STEP 9] Trying to extract username from message...');
      const usernameMatch = message.match(/@(\w+)/);
      if (usernameMatch) {
        username = usernameMatch[1];
        console.log('✅ [STEP 9] Extracted username from message:', username);
      } else {
        console.log('⚠️ [STEP 9] No username found in message');
      }
    }

    // Fallback: generate username from address if World ID doesn't provide one
    if (!username) {
      username = `user_${address.substring(2, 8)}`;
      console.log('⚠️ [STEP 9] Using fallback username:', username);
    } else {
      console.log('✅ [STEP 9] Using World ID username:', username);
    }

    // If user doesn't exist, create a new one
    if (!user) {
      console.log('🆕 [STEP 10] Creating new user...');
      console.log('🆕 [STEP 10] Username:', username);
      console.log('🆕 [STEP 10] Display name:', worldIdUsername ? `@${worldIdUsername}` : username);
      console.log('🆕 [STEP 10] Wallet address:', address);
      
      try {
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
        
        console.log('✅ [STEP 10] User created successfully!');
        console.log('✅ [STEP 10] User ID:', user.id);
        console.log('✅ [STEP 10] Username:', user.username);
      } catch (createError: any) {
        console.error('❌ [STEP 10] Failed to create user:', createError);
        console.error('❌ [STEP 10] Error message:', createError?.message);
        console.error('❌ [STEP 10] Error code:', createError?.code);
        console.error('❌ [STEP 10] Error meta:', createError?.meta);
        throw createError;
      }
    } else {
      console.log('👤 [STEP 10] User already exists');
      // User exists - update with latest World ID username if we got one from client
      console.log('📝 [STEP 11] Checking if username should be updated...');
      const shouldUpdateUsername = worldIdUsername && 
                                   user.username !== worldIdUsername && 
                                   !user.username.startsWith('user_'); // Don't update if user has a real username already
      
      console.log('📝 [STEP 11] Should update?', shouldUpdateUsername);
      
      if (shouldUpdateUsername) {
        console.log(`📝 [STEP 11] Updating username from ${user.username} to ${worldIdUsername}`);
        
        try {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              username: worldIdUsername,
              displayName: `@${worldIdUsername}`,
            },
          });
          console.log('✅ [STEP 11] Username updated successfully');
        } catch (updateError: any) {
          console.error('❌ [STEP 11] Failed to update username:', updateError);
          console.error('❌ [STEP 11] Error message:', updateError?.message);
          // Continue with old username if update fails
        }
      }
      
      console.log('✅ [STEP 11] User found:', user.id, user.username);
    }

    console.log('🎉 [STEP 12] Preparing successful response...');
    console.log('🎉 [STEP 12] User object:', {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified,
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('💥 [ERROR] ==========================================');
    console.error('💥 [ERROR] Caught error in verify-wallet-auth:');
    console.error('💥 [ERROR] Error type:', error?.constructor?.name);
    console.error('💥 [ERROR] Error message:', error?.message);
    console.error('💥 [ERROR] Error code:', error?.code);
    console.error('💥 [ERROR] Error stack:', error?.stack);
    console.error('💥 [ERROR] Full error object:', JSON.stringify(error, null, 2));
    console.error('💥 [ERROR] ==========================================');
    
    return NextResponse.json(
      { 
        error: 'Failed to verify wallet authentication',
        details: error?.message || 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown',
        errorCode: error?.code || 'Unknown',
        stack: error?.stack || 'No stack trace'
      },
      { status: 500 }
    );
  }
}
