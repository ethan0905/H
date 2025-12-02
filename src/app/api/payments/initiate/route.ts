import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, description } = await req.json()

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique reference ID
    const reference = crypto.randomUUID().replace(/-/g, '')

    // Store payment intent in database
    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        reference,
        userId,
        amount: parseFloat(amount),
        description: description || 'Payment',
        status: 'pending',
      },
    })

    console.log('✅ Payment intent created:', {
      reference,
      userId,
      amount,
    })

    return NextResponse.json({
      success: true,
      reference: paymentIntent.reference,
      id: paymentIntent.id,
    })
  } catch (error) {
    console.error('❌ Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
