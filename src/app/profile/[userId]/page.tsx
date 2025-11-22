'use client';

import { useParams } from 'next/navigation';
import Profile from '@/components/Profile';

export default function UserProfilePage() {
  const params = useParams();
  const rawUserId = params.userId as string;
  const userId = decodeURIComponent(rawUserId);

  console.log('UserProfilePage render:', { params, rawUserId, userId });

  return <Profile userId={userId} />;
}
