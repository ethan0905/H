/**
 * World Pay Integration Utilities
 * Handles payment flows using MiniKit World Pay SDK
 */

import { MiniKit, PayCommandInput, Tokens, ResponseEvent } from '@worldcoin/minikit-js'

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
}

/**
 * Initiates a payment using World Pay
 * @param amount Amount in USD (e.g., 7.40)
 * @param description Payment description
 * @param reference Unique reference for this payment
 * @returns Promise with payment result
 */
export async function initiateWorldPayment(
  amount: number,
  description: string,
  reference: string
): Promise<PaymentResult> {
  try {
    // Check if MiniKit is installed (running in World App)
    if (!MiniKit.isInstalled()) {
      console.warn('⚠️ MiniKit not installed - cannot process payment')
      return {
        success: false,
        error: 'World App is required to process payments. Please open this app in World App.',
      }
    }

    console.log('💰 Initiating payment:', { amount, description, reference })

    // Create payment command
    const payload: PayCommandInput = {
      reference: reference,
      to: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || '0x0000000000000000000000000000000000000000', // Replace with your merchant address
      tokens: [
        {
          symbol: Tokens.WLD, // World token
          token_amount: amount.toString(),
        },
        {
          symbol: Tokens.USDC, // USDC
          token_amount: amount.toString(),
        },
      ],
      description: description,
    }

    console.log('📤 Sending payment command:', payload)

    // Send payment command
    const { finalPayload } = await MiniKit.commandsAsync.pay(payload)

    // Check if user confirmed the payment
    if (finalPayload.status === 'success') {
      console.log('✅ Payment successful:', finalPayload)
      return {
        success: true,
        transactionId: finalPayload.transaction_id || reference,
      }
    } else {
      console.log('❌ Payment failed or cancelled:', finalPayload)
      return {
        success: false,
        error: finalPayload.status === 'error' ? 'Payment failed' : 'Payment cancelled by user',
      }
    }
  } catch (error) {
    console.error('❌ Error processing payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Subscribe to payment events
 * Useful for handling payment confirmations and updates
 */
export function subscribeToPaymentEvents(
  onPaymentSuccess: (transactionId: string) => void,
  onPaymentError: (error: string) => void
) {
  if (!MiniKit.isInstalled()) {
    console.warn('⚠️ MiniKit not installed - cannot subscribe to payment events')
    return
  }

  // Subscribe to payment responses
  MiniKit.subscribe(ResponseEvent.MiniAppPayment, async (payload) => {
    console.log('📨 Payment event received:', payload)

    if (payload.status === 'success') {
      const transactionId = payload.transaction_id || 'unknown'
      onPaymentSuccess(transactionId)
    } else {
      const error = payload.status === 'error' ? 'Payment failed' : 'Payment cancelled'
      onPaymentError(error)
    }
  })
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(userId: string, type: string): string {
  const timestamp = Date.now()
  return `${type}_${userId}_${timestamp}`
}
