'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { MainApp } from '@/components/layout/MainApp';
import AuthButton from '@/components/auth/AuthButton';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const { user, isAuthenticated, worldIdVerification, _hasHydrated, setHasHydrated } = useUserStore();

  // Check for guest mode in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('guest') === 'true' && process.env.NODE_ENV === 'development') {
        console.log('🔓 Guest mode enabled');
        setGuestMode(true);
      }
    }
  }, []);

  // Log whenever auth state changes
  useEffect(() => {
    if (!_hasHydrated) return;
    
    console.log('🔄 AUTH STATE CHANGED');
    console.log('- isAuthenticated:', isAuthenticated);
    console.log('- user:', user);
    console.log('- worldIdVerification:', worldIdVerification);
    console.log('- _hasHydrated:', _hasHydrated);
  }, [isAuthenticated, user, worldIdVerification, _hasHydrated]);

  useEffect(() => {
    try {
      console.log('='.repeat(50));
      console.log('🚀 H WORLD APP STARTING');
      console.log('='.repeat(50));
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('🌐 Window location:', window.location.href);
      console.log('🔐 Auth status:', isAuthenticated);
      console.log('👤 User:', user);
      console.log('💧 Hydrated:', _hasHydrated);
      console.log('🌍 App ID:', process.env.NEXT_PUBLIC_MINIKIT_APP_ID);
      console.log('⚙️  Environment:', process.env.NODE_ENV);
      console.log('🐛 Eruda enabled:', process.env.NEXT_PUBLIC_ENABLE_ERUDA);
      console.log('='.repeat(50));
      setIsClient(true);
      console.log('✅ App mounted successfully');

      // Fallback: Force hydration after 1 second if it hasn't happened (reduced from 2s)
      const hydrationTimer = setTimeout(() => {
        if (!_hasHydrated) {
          console.warn('⚠️  Hydration timeout - forcing hydration complete');
          setHasHydrated(true);
          setHydrationTimeout(true);
        }
      }, 1000);

      return () => clearTimeout(hydrationTimer);
    } catch (err) {
      console.error('❌ Error mounting app:', err);
      console.error('📍 Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [_hasHydrated, setHasHydrated]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md rounded-lg border border-destructive bg-card p-6 text-center">
          <h2 className="mb-4 text-xl font-bold text-destructive">Error</h2>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-black hover:bg-brand-600"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  // Wait for both client-side mount AND Zustand hydration
  if (!isClient || !_hasHydrated) {
    console.log('🔄 Loading state:', { isClient, _hasHydrated, hydrationTimeout });
    
    return (
      <div 
        className="flex min-h-screen items-center justify-center" 
        style={{ 
          backgroundColor: '#000000',
          color: '#00FFBE',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '72px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#00FFBE'
          }}>
            H
          </div>
          <p style={{ 
            color: '#ffffff', 
            fontSize: '18px',
            marginBottom: '10px'
          }}>
            {!isClient ? 'Loading H World...' : 'Restoring session...'}
          </p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #00FFBE',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '20px auto',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ 
            color: '#666', 
            fontSize: '12px',
            marginTop: '20px'
          }}>
            {!_hasHydrated && !hydrationTimeout ? 'Hydrating state...' : 'Almost ready...'}
          </p>
          {hydrationTimeout && (
            <p style={{ 
              color: '#ff9900', 
              fontSize: '11px',
              marginTop: '10px'
            }}>
              Starting fresh session
            </p>
          )}
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show verification success state briefly before redirecting
  if (user && !isAuthenticated) {
    console.log('⚠️  INCONSISTENT STATE: User exists but isAuthenticated is false');
    console.log('User:', user);
    console.log('Fixing state...');
    // This shouldn't happen, but if it does, log it
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mb-4 flex items-center justify-center">
              <span className="text-6xl font-bold text-[#00FFBD] glow-cyan">H</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome to H World
            </h1>
            <p className="text-lg text-zinc-400 mb-8">
              Connect with the world through verified identities and decentralized conversations.
            </p>
          </div>
          
          <div className="bg-zinc-950 p-8 rounded-2xl shadow-lg border border-zinc-800">
            <div className="mb-6">
              <div className="w-16 h-16 bg-black border-2 border-[#00FFBD] rounded-full mx-auto mb-4 flex items-center justify-center glow-cyan">
                <span className="text-2xl font-bold text-[#00FFBD]">H</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Join the Conversation
              </h2>
              <p className="text-zinc-400 text-sm">
                Authenticate with World ID or connect your wallet to get started.
              </p>
            </div>
            
            <AuthButton />

            {/* Development Mode: Browse as Guest */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-950 px-2 text-zinc-500">Or</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('🔓 Browsing as guest (dev mode)');
                    // Render MainApp without authentication
                    window.location.href = '/?guest=true';
                  }}
                  className="w-full py-3 px-4 border-2 border-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
                >
                  Continue as Guest (Dev Mode)
                </button>
                <p className="mt-2 text-xs text-zinc-500">
                  Browse seeded data without authentication
                </p>
              </>
            )}
            
            <div className="mt-6 text-xs text-zinc-500">
              <p>
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">🔐</div>
              <p className="text-sm text-muted-foreground">Secure Authentication</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🌐</div>
              <p className="text-sm text-muted-foreground">Decentralized</p>
            </div>
            <div>
              <div className="text-2xl mb-2">✨</div>
              <p className="text-sm text-muted-foreground">Verified Identities</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Allow guest mode in development
  if (guestMode && process.env.NODE_ENV === 'development') {
    console.log('✅ GUEST MODE - Rendering MainApp without auth');
    return (
      <div>
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            🔓 Guest Mode (Development) - Browsing seeded data without authentication
          </p>
        </div>
        <MainApp userId={null} />
      </div>
    );
  }

  console.log('✅ USER IS AUTHENTICATED - Rendering MainApp');
  console.log('User ID:', user?.id);
  console.log('User object:', user);

  return <MainApp userId={user?.id || null} />;
}
