'use client';

import { useState, useCallback } from 'react';
import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js';
import { useUserStore } from '@/store/userStore';
import WorldIDQR from './WorldIDQR';

interface AuthButtonProps {
  className?: string;
}

export default function AuthButton({ className = '' }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { setUser, setWorldIdVerification, setError } = useUserStore();

  const handleWorldIDVerification = useCallback(async (proof: ISuccessResult) => {
    try {
      setIsLoading(true);
      
      console.log('=== AUTH BUTTON WORLD ID VERIFICATION ===');
      console.log('1. PROOF RECEIVED FROM QR COMPONENT:');
      console.log(JSON.stringify(proof, null, 2));
      console.log('2. PROOF STRUCTURE ANALYSIS:');
      console.log('- Keys:', Object.keys(proof));
      console.log('- proof type:', typeof proof.proof);
      console.log('- proof length:', proof.proof?.length);
      console.log('- nullifier_hash:', proof.nullifier_hash);
      console.log('- merkle_root:', proof.merkle_root);
      console.log('- verification_level:', proof.verification_level);
      
      console.log('3. SENDING TO BACKEND...');
      
      // In a real app, you'd send this to your backend for verification
      const response = await fetch('/api/verify-world-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proof),
      });

      console.log('4. BACKEND RESPONSE:');
      console.log('Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', JSON.stringify(errorData, null, 2));
        const errorMessage = errorData.error || 'World ID verification failed';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', JSON.stringify(result, null, 2));
      
      // Set the World ID verification
      console.log('5. SETTING WORLD ID VERIFICATION IN STORE...');
      setWorldIdVerification({
        verified: true,
        verification_level: proof.verification_level as 'orb' | 'device',
        nullifier_hash: proof.nullifier_hash,
      });

      // Create a user account or login
      console.log('6. CREATING USER OBJECT...');
      const mockUser = {
        id: proof.nullifier_hash,
        username: `human_${proof.nullifier_hash.slice(-8)}`,
        displayName: 'Verified Human',
        bio: `Verified ${proof.verification_level === 'orb' ? 'Orb' : 'Device'} human on World ID`,
        isVerified: true,
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${proof.nullifier_hash}`,
        profilePictureUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${proof.nullifier_hash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('7. SETTING USER IN STORE...');
      console.log('User object:', mockUser);
      setUser(mockUser);
      
      console.log('✅ VERIFICATION COMPLETE! User should be logged in now.');
      console.log('8. CHECKING STORE STATE...');
      
      // Show success message
      setSuccessMessage('✅ World ID verified! Logging you in...');
      
      // The store should trigger a re-render of the page component
      // Wait a brief moment for the success message to be visible
      setTimeout(() => {
        console.log('9. REDIRECTING TO MAIN APP...');
      }, 1000);
      
    } catch (error) {
      console.error('World ID verification error:', error);
      setSuccessMessage(null);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setLocalError(errorMessage);
      setError(errorMessage);
      
      // Temporary development mode fallback for testing
      if (process.env.NODE_ENV === 'development' && error instanceof Error && error.message.includes('invalid_format')) {
        console.log('Development mode: Creating user despite verification failure');
        
        // Set partial World ID verification for testing
        setWorldIdVerification({
          verified: false, // Mark as unverified since backend verification failed
          verification_level: proof.verification_level as 'orb' | 'device',
          nullifier_hash: proof.nullifier_hash,
        });

        // Create a test user account
        const testUser = {
          id: proof.nullifier_hash || 'test_user',
          username: `test_${proof.nullifier_hash?.slice(-8) || Math.random().toString(36).slice(-8)}`,
          displayName: 'Test User (Unverified)',
          bio: 'Development test user - verification bypassed',
          isVerified: false,
          avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${proof.nullifier_hash || 'test'}`,
          profilePictureUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${proof.nullifier_hash || 'test'}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setUser(testUser);
        return; // Skip setting error
      }
      
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setWorldIdVerification, setError]);

  const handleWalletAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!MiniKit.isInstalled()) {
        throw new Error('MiniKit is not installed');
      }

      // Generate a nonce for security
      const nonceResponse = await fetch('/api/nonce');
      const { nonce } = await nonceResponse.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        statement: 'Sign in to X World',
      });

      if (finalPayload.status === 'error') {
        throw new Error('Wallet authentication failed');
      }

      // Verify the wallet auth in backend
      const response = await fetch('/api/verify-wallet-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (!response.ok) {
        throw new Error('Wallet authentication failed');
      }

      const result = await response.json();
      
      // Create user from wallet address
      const mockUser = {
        id: finalPayload.address,
        walletAddress: finalPayload.address,
        username: `user_${finalPayload.address.slice(-8)}`,
        displayName: 'World User',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);
      
    } catch (error) {
      console.error('Wallet auth error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setError]);

  const handleVerifyClick = async () => {
    console.log('🌍 World ID Verify button clicked');
    console.log('📱 MiniKit installed:', MiniKit.isInstalled());
    
    // Clear previous errors
    setLocalError(null);
    setError(null);
    setSuccessMessage(null);
    
    if (!MiniKit.isInstalled()) {
      console.log('❌ MiniKit not installed, showing QR instead');
      setShowQR(true);
      return;
    }

    setIsLoading(true);

    try {
      const actionId = process.env.NEXT_PUBLIC_WORLD_ID_ACTION || 'verify-human';
      console.log('🎯 Action ID:', actionId);
      console.log('🔐 Verification Level:', VerificationLevel.Orb);

      console.log('📞 Calling MiniKit.commandsAsync.verify...');
      
      // Trigger World ID verification using async API
      const response = await MiniKit.commandsAsync.verify({
        action: actionId,
        verification_level: VerificationLevel.Device, // Use Device for broader compatibility
      });

      console.log('📦 MiniKit response received:', response);
      console.log('📦 Response structure:', {
        hasFinalPayload: !!response.finalPayload,
        status: response.finalPayload?.status,
        keys: response.finalPayload ? Object.keys(response.finalPayload) : []
      });

      if (response.finalPayload.status === 'success') {
        console.log('✅ World ID verification successful!', response.finalPayload);
        await handleWorldIDVerification(response.finalPayload);
      } else {
        console.error('❌ World ID verification failed:', response.finalPayload);
        const errorMsg = response.finalPayload.error_code || 'World ID verification was cancelled or failed';
        setLocalError(errorMsg);
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ World ID verification error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      const errorMsg = error.message || 'World ID verification failed';
      setLocalError(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      console.log('✅ Verification process completed');
    }
  };

  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID || '';
  const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION || 'sign-in';

  if (showQR) {
    return (
      <div className={`space-y-4 ${className}`}>
        <WorldIDQR 
          app_id={appId}
          action={action}
          onSuccess={handleWorldIDVerification}
          onError={(error) => setError('World ID verification failed')}
        />
        
        <div className="text-center">
          <button
            onClick={() => setShowQR(false)}
            className="text-sm text-primary hover:text-primary/80 underline"
          >
            ← Back to other options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Message */}
      {localError && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-center">
          <p className="text-sm font-medium">❌ {localError}</p>
          <button 
            onClick={() => setLocalError(null)}
            className="text-xs text-red-300 hover:text-red-200 mt-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-center animate-pulse">
          {successMessage}
        </div>
      )}
      
      {/* World ID Verification Button */}
      <button
        onClick={handleVerifyClick}
        disabled={isLoading || !!successMessage}
        style={{
          backgroundColor: '#00FFBE',
          color: '#000000',
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          fontWeight: '600',
          border: 'none',
          cursor: isLoading || successMessage ? 'not-allowed' : 'pointer',
          opacity: isLoading || successMessage ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          if (!isLoading && !successMessage) e.currentTarget.style.backgroundColor = '#00E6AA';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#00FFBE';
        }}
      >
        {successMessage ? '✅ Verified!' : isLoading ? '⏳ Verifying...' : MiniKit.isInstalled() ? '🌍 Verify with World ID' : '🌍 Verify with World ID (QR)'}
      </button>
      
      {/* Divider */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-3 text-xs text-muted-foreground bg-background">or</span>
        <div className="flex-1 border-t border-border"></div>
      </div>
      
      {/* Wallet Connect */}
      <button
        onClick={handleWalletAuth}
        disabled={isLoading}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-medium transition-colors"
      >
        {isLoading ? 'Connecting...' : '👛 Connect Wallet'}
      </button>
      
      <p className="text-xs text-muted-foreground text-center">
        World ID provides proof of personhood while protecting your privacy
      </p>
    </div>
  );
}
