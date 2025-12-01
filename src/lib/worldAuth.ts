/**
 * World ID Wallet Authentication
 * Implementation based on: https://docs.world.org/mini-apps/commands/wallet-auth
 */

import { MiniKit, ISuccessResult } from '@worldcoin/minikit-js';

interface WalletAuthParams {
  nonce: string;
  expirationTime: Date;
  statement?: string;
}

export interface WalletAuthResult {
  success: boolean;
  payload?: {
    nonce: string;
    signature: string;
    address: string;
    message: string;
  };
  error?: string;
}

/**
 * Generate a cryptographically secure nonce for wallet authentication
 */
export async function generateNonce(): Promise<string> {
  try {
    const response = await fetch('/api/nonce', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate nonce');
    }
    
    const data = await response.json();
    return data.nonce;
  } catch (error) {
    console.error('Error generating nonce:', error);
    // Fallback to client-side generation
    return `nonce_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Initiate wallet authentication with World ID
 * This prompts the user to sign a message with their wallet
 */
export async function initiateWalletAuth(params: WalletAuthParams): Promise<WalletAuthResult> {
  try {
    console.log('🔐 Initiating wallet auth with params:', params);

    // Check if MiniKit is installed
    if (!MiniKit.isInstalled()) {
      console.error('❌ MiniKit is not installed');
      return {
        success: false,
        error: 'World App is required. Please open this app in World App.',
      };
    }

    const { nonce, expirationTime, statement } = params;

    // Call MiniKit's walletAuth command
    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce,
      requestId: `auth_${Date.now()}`,
      expirationTime,
      notBefore: new Date(new Date().getTime()),
      statement: statement || 'Sign in to H World - The verified human social network',
    });

    console.log('✅ Wallet auth response received:', finalPayload);

    if (finalPayload.status === 'error') {
      console.error('❌ Wallet auth failed:', finalPayload);
      return {
        success: false,
        error: 'Wallet authentication failed',
      };
    }

    // Extract the signature and address from the response
    const { signature, address, message } = finalPayload;

    return {
      success: true,
      payload: {
        nonce,
        signature,
        address,
        message,
      },
    };
  } catch (error) {
    console.error('❌ Error during wallet auth:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Wallet authentication failed',
    };
  }
}

/**
 * Verify the wallet authentication signature on the backend
 */
export async function verifyWalletAuth(payload: WalletAuthResult['payload']): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    if (!payload) {
      return {
        success: false,
        error: 'No payload to verify',
      };
    }

    console.log('📤 Sending wallet auth to backend for verification...');

    const response = await fetch('/api/verify-wallet-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Verification failed',
      };
    }

    const result = await response.json();
    console.log('✅ Wallet auth verified successfully:', result);

    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('❌ Error verifying wallet auth:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Complete wallet authentication flow
 * 1. Generate nonce
 * 2. Initiate wallet auth with MiniKit
 * 3. Verify signature on backend
 */
export async function authenticateWithWallet(): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    console.log('🚀 Starting wallet authentication flow...');

    // Step 1: Generate nonce
    const nonce = await generateNonce();
    console.log('✅ Nonce generated:', nonce);

    // Step 2: Set expiration time (5 minutes from now)
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

    // Step 3: Initiate wallet auth
    const authResult = await initiateWalletAuth({
      nonce,
      expirationTime,
      statement: 'Sign in to H World - Verified human social network powered by World ID',
    });

    if (!authResult.success || !authResult.payload) {
      return {
        success: false,
        error: authResult.error || 'Wallet authentication failed',
      };
    }

    console.log('✅ Wallet signature received');

    // Step 4: Verify on backend
    const verificationResult = await verifyWalletAuth(authResult.payload);

    if (!verificationResult.success) {
      return {
        success: false,
        error: verificationResult.error || 'Verification failed',
      };
    }

    console.log('✅ Authentication complete!');

    return {
      success: true,
      user: verificationResult.user,
    };
  } catch (error) {
    console.error('❌ Wallet authentication flow failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}
