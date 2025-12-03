import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId, displayName, username, bio, profilePictureUrl } = await request.json();

    if (!userId || !displayName || !username) {
      return NextResponse.json(
        { error: 'User ID, display name, and username are required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain lowercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        username,
        bio: bio || null,
        ...(profilePictureUrl && {
          profilePictureUrl,
          avatar: profilePictureUrl,
        }),
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      displayName: updatedUser.displayName,
      username: updatedUser.username,
      bio: updatedUser.bio,
      profilePictureUrl: updatedUser.profilePictureUrl,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
