/**
 * Payment Verification API Endpoint
 * Verifies payment status after Worldcoin transaction
 * Updates user subscription status upon successful verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, transactionId, userId } = body

    console.log('🔍 Verifying payment:', { reference, transactionId, userId })

    // Validate required fields
    if (!reference || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: reference and userId are required' },
        { status: 400 }
      )
    }

    // Find the payment intent
    const paymentIntent = await prisma.paymentIntent.findFirst({
      where: {
        reference,
        userId,
      },
    })

    if (!paymentIntent) {
      console.error('❌ Payment intent not found:', { reference, userId })
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    // Check if payment was already verified
    if (paymentIntent.status === 'completed') {
      console.log('⚠️ Payment already verified:', reference)
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        isPro: true,
      })
    }

    // In production, you would verify the transaction on-chain here
    // For now, we'll accept the payment if a transactionId is provided
    const isVerified = !!transactionId

    if (!isVerified) {
      console.error('❌ Payment verification failed: No transaction ID')
      
      // Update payment intent to failed
      await prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: {
          status: 'failed',
          transactionId: null,
        },
      })

      return NextResponse.json(
        { error: 'Payment verification failed: No transaction ID provided' },
        { status: 400 }
      )
    }

    // Update payment intent to completed
    await prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'completed',
        transactionId,
      },
    })

    // Update user to Pro status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPro: true,
      },
      select: {
        id: true,
        walletAddress: true,
        worldId: true,
        isPro: true,
        username: true,
        displayName: true,
      },
    })

    console.log('✅ Payment verified and user upgraded to Pro:', {
      userId,
      reference,
      transactionId,
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      user: updatedUser,
      isPro: true,
    })
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const userId = searchParams.get('userId')

    if (!reference || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: reference and userId' },
        { status: 400 }
      )
    }

    const paymentIntent = await prisma.paymentIntent.findFirst({
      where: {
        reference,
        userId,
      },
      select: {
        id: true,
        reference: true,
        status: true,
        amount: true,
        transactionId: true,
        createdAt: true,
      },
    })

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: paymentIntent,
    })
  } catch (error) {
    console.error('❌ Error fetching payment status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch payment status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
