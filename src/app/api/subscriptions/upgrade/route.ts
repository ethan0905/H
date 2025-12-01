import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MiniKit } from '@worldcoin/minikit-js';

// POST /api/subscriptions/upgrade - Upgrade to Pro plan with World Pay
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already has active Pro subscription
    if (user.subscription?.plan === 'pro' && user.subscription?.status === 'active') {
      return NextResponse.json(
        { error: 'Already have an active Pro subscription' },
        { status: 400 }
      );
    }

    // Return payment intent for World Pay
    // The actual payment will be processed on the client side using MiniKit
    const paymentIntent = {
      amount: 7.40,
      currency: 'USD',
      description: 'H World Pro Creator - Monthly Subscription',
      userId,
      planType: 'pro'
    };

    return NextResponse.json({ 
      success: true,
      paymentIntent,
      message: 'Payment intent created. Complete payment in World App.'
    });
  } catch (error) {
    console.error('Error creating upgrade intent:', error);
    return NextResponse.json(
      { error: 'Failed to create upgrade intent' },
      { status: 500 }
    );
  }
}
