import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MiniKitProvider from '@/components/providers/MiniKitProvider';
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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <MiniKitProvider>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
            <Toaster />
          </MiniKitProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
