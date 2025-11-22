'use client';

import { useUserStore } from '@/store/userStore';
import Profile from '@/components/Profile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated } = useUserStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  console.log('Profile page render:', { user, isAuthenticated, isHydrated });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated || !user) {
        console.log('Profile page: Not authenticated after hydration, redirecting to home');
        router.replace('/');
      } else {
        // Redirect to the user-specific profile page to avoid duplication
        console.log('Profile page: Redirecting to user-specific profile');
        router.replace(`/profile/${encodeURIComponent(user.id)}`);
      }
    }
  }, [isAuthenticated, user, router, isHydrated]);

  // Show loading state while hydrating to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // This component just handles redirects, no UI needed
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
}
