import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MiniKitProvider from '@/components/providers/MiniKitProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Toaster from '@/components/ui/Toaster';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'X World - Social Network for Humans',
  description: 'A Twitter-like social platform built for verified humans using World ID',
  keywords: ['social', 'twitter', 'world id', 'minikit', 'blockchain'],
  authors: [{ name: 'X World Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
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
