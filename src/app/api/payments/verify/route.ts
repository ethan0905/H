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
    const { reference, transactionId, userId, walletAddress } = body

    console.log('🔍 Verifying payment:', { reference, transactionId, userId, walletAddress })

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
      
      // Get user data to return
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          walletAddress: true,
          worldId: true,
          isPro: true,
          isSeasonOneOG: true,
          username: true,
          displayName: true,
        },
      })
      
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        user,
        isPro: true,
        isSeasonOneOG: user?.isSeasonOneOG || false,
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

    // Get user's wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        walletAddress: true,
      },
    })

    const verifiedWalletAddress = walletAddress || user?.walletAddress

    // Update payment intent to completed
    await prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'completed',
        transactionId,
        verifiedAt: new Date(),
      },
    })

    // Update user to Pro status and grant Season 1 OG badge
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPro: true,
        isSeasonOneOG: true, // Grant Season 1 OG Human badge
      },
      select: {
        id: true,
        walletAddress: true,
        worldId: true,
        isPro: true,
        isSeasonOneOG: true,
        username: true,
        displayName: true,
      },
    })

    // Create or update subscription record
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: 'pro',
        status: 'active',
        walletAddress: verifiedWalletAddress,
        worldPaymentId: transactionId,
        startDate: new Date(),
        autoRenew: true,
      },
      update: {
        plan: 'pro',
        status: 'active',
        walletAddress: verifiedWalletAddress,
        worldPaymentId: transactionId,
        startDate: new Date(),
        autoRenew: true,
        updatedAt: new Date(),
      },
    })

    console.log('✅ Payment verified, user upgraded to Pro, and Season 1 OG badge granted:', {
      userId,
      reference,
      transactionId,
      subscriptionId: subscription.id,
      walletAddress: verifiedWalletAddress,
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      user: updatedUser,
      isPro: true,
      isSeasonOneOG: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
      },
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
