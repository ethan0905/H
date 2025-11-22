'use client';

import { ReactNode } from 'react';

interface ToasterProps {
  children?: ReactNode;
}

export default function Toaster({ children }: ToasterProps) {
  // Simple toaster implementation
  // In a real app, you'd want to use a more sophisticated toast library
  return (
    <div className="fixed top-4 right-4 z-50">
      {children}
    </div>
  );
}
