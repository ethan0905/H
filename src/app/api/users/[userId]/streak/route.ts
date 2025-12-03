import { NextRequest, NextResponse } from 'next/server';
import { getUserStreak } from '@/lib/streak-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const streakData = await getUserStreak(userId);

    return NextResponse.json({
      success: true,
      ...streakData,
    });
  } catch (error) {
    console.error('Error fetching user streak:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch streak data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
