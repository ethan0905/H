'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { MainApp } from '@/components/layout/MainApp';
import AuthButton from '@/components/auth/AuthButton';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);
  const { user, isAuthenticated, worldIdVerification, _hasHydrated, setHasHydrated } = useUserStore();

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

      // Fallback: Force hydration after 2 seconds if it hasn't happened
      const hydrationTimer = setTimeout(() => {
        if (!_hasHydrated) {
          console.warn('⚠️  Hydration timeout - forcing hydration complete');
          setHasHydrated(true);
          setHydrationTimeout(true);
        }
      }, 2000);

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mb-4 flex items-center justify-center">
              <span className="text-6xl font-bold text-brand">H</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome to H World
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with the world through verified identities and decentralized conversations.
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
            <div className="mb-6">
              <div className="w-16 h-16 bg-brand/10 border-2 border-brand rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-brand">H</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Join the Conversation
              </h2>
              <p className="text-muted-foreground text-sm">
                Authenticate with World ID or connect your wallet to get started.
              </p>
            </div>
            
            <AuthButton />
            
            <div className="mt-6 text-xs text-muted-foreground">
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

  console.log('✅ USER IS AUTHENTICATED - Rendering MainApp');
  console.log('User ID:', user?.id);
  console.log('User object:', user);

  return <MainApp userId={user?.id || null} />;
}
