/**
 * Cron Job API Route
 * 
 * Trigger gamification jobs via HTTP (for Vercel Cron or manual triggers)
 * Secure this route in production with a secret token
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateAllUserRanks } from '@/lib/gamification/rankUpdateJob';
import { runLeaderboardUpdateJob } from '@/lib/gamification/leaderboardUpdateJob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Security: Check for secret token in production
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const { job } = await request.json();

    console.log(`🔧 Running cron job: ${job}`);

    switch (job) {
      case 'update-ranks':
        const rankResult = await updateAllUserRanks();
        return NextResponse.json({
          success: true,
          job: 'update-ranks',
          result: rankResult,
        });

      case 'update-leaderboards':
        await runLeaderboardUpdateJob();
        return NextResponse.json({
          success: true,
          job: 'update-leaderboards',
          message: 'Leaderboards updated successfully',
        });

      case 'all':
        // Run all jobs sequentially
        const ranks = await updateAllUserRanks();
        await runLeaderboardUpdateJob();
        return NextResponse.json({
          success: true,
          job: 'all',
          results: {
            ranks,
            leaderboards: 'updated',
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid job type. Use: update-ranks, update-leaderboards, or all' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Job execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow GET for status check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    jobs: ['update-ranks', 'update-leaderboards', 'all'],
    note: 'Use POST with { "job": "<job-name>" } to trigger a job',
  });
}
