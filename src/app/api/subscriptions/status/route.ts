import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Find active subscription for the user
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get user data for Season One OG status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isSeasonOneOG: true,
        isPro: true,
      },
    })

    return NextResponse.json({
      plan: subscription?.plan || 'free',
      status: subscription?.status || 'inactive',
      endDate: subscription?.endDate,
      isSeasonOneOG: user?.isSeasonOneOG || false,
      isPro: user?.isPro || false,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
