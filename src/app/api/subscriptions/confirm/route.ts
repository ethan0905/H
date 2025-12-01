import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, paymentIntentId, worldPaymentId, plan } = body

    if (!userId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the payment intent exists and is pending
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        worldPaymentId: paymentIntentId,
        status: 'pending',
      },
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Payment intent not found or already processed' },
        { status: 404 }
      )
    }

    // Calculate end date (30 days from now)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    // Update subscription to active
    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        status: 'active',
        startDate,
        endDate,
        worldPaymentId: worldPaymentId || paymentIntentId,
        autoRenew: true,
      },
    })

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
