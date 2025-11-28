'use client';

import { ReactNode, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface MiniKitProviderProps {
  children: ReactNode;
}

export default function MiniKitProvider({ children }: MiniKitProviderProps) {
  useEffect(() => {
    console.log('🔧 MiniKitProvider mounted');
    
    // Get the app ID from environment variables
    const appId = process.env.NEXT_PUBLIC_MINIKIT_APP_ID;
    
    console.log('🌍 World App ID:', appId);
    console.log('🔍 Environment:', process.env.NODE_ENV);
    
    if (!appId) {
      console.error('❌ NEXT_PUBLIC_MINIKIT_APP_ID is not configured');
      console.log('💡 Make sure your .env.local has NEXT_PUBLIC_MINIKIT_APP_ID set');
      return;
    }

    try {
      // Install MiniKit with the app ID
      console.log('📦 Installing MiniKit...');
      MiniKit.install(appId);
      console.log('✅ MiniKit.install() called');
      
      // Check if MiniKit is installed
      const isInstalled = MiniKit.isInstalled();
      console.log('📱 Is MiniKit installed:', isInstalled);
      
      if (isInstalled) {
        console.log('✅ MiniKit installed successfully - running in World App');
      } else {
        console.log('⚠️ MiniKit not available - not running in World App (this is OK for testing)');
      }
    } catch (error) {
      console.error('❌ Error installing MiniKit:', error);
    }
  }, []);

  return <>{children}</>;
}
