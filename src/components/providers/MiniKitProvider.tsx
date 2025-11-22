'use client';

import { ReactNode, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface MiniKitProviderProps {
  children: ReactNode;
}

export default function MiniKitProvider({ children }: MiniKitProviderProps) {
  useEffect(() => {
    // Get the app ID from environment variables
    const appId = process.env.NEXT_PUBLIC_MINIKIT_APP_ID;
    
    if (!appId) {
      console.error('NEXT_PUBLIC_MINIKIT_APP_ID is not configured');
      return;
    }

    // Install MiniKit with the app ID
    MiniKit.install(appId);
    
    // Only log MiniKit status in development and when it's actually installed
    if (process.env.NODE_ENV === 'development') {
      const isInstalled = MiniKit.isInstalled();
      if (isInstalled) {
        console.log('MiniKit installed successfully');
      } else {
        console.log('MiniKit not available (not running in World App)');
      }
    }
  }, []);

  return <>{children}</>;
}
