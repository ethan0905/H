import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MiniKitProvider from '@/components/providers/MiniKitProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Toaster from '@/components/ui/Toaster';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErudaDebugger from '@/components/ErudaDebugger';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'H World - Social Network for Humans',
  description: 'A social platform built for verified humans using World ID',
  keywords: ['social', 'twitter', 'world id', 'minikit', 'blockchain', 'humanverse'],
  authors: [{ name: 'H World Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'H World',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00FFBE',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="H World" />
      </head>
      <body className={`${inter.className} overflow-x-hidden max-w-full`}>
        <ErudaDebugger />
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <MiniKitProvider>
              <div className="min-h-screen bg-background text-foreground">
                {children}
              </div>
              <Toaster />
            </MiniKitProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
