'use client';

import { useEffect } from 'react';

export default function ErudaDebugger() {
  useEffect(() => {
    // Only load Eruda in development or if specifically enabled
    const shouldLoadEruda = 
      process.env.NODE_ENV === 'development' || 
      process.env.NEXT_PUBLIC_ENABLE_ERUDA === 'true' ||
      typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (shouldLoadEruda) {
      import('eruda').then((eruda) => {
        eruda.default.init();
        console.log('🐛 Eruda debugger initialized - Tap the icon in bottom-right to open console');
      });
    }
  }, []);

  return null;
}
