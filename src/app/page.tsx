'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { MainApp } from '@/components/layout/MainApp';
import AuthButton from '@/components/auth/AuthButton';

export default function HomePage() {
  const { user, isAuthenticated } = useUserStore();

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

  return <MainApp userId={user?.id || null} />;
}
