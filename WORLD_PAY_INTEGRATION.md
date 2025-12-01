# World Pay Integration Guide

This document provides step-by-step instructions for integrating World Pay via MiniKit for Pro plan subscriptions in H World.

## Overview

The H World Pro subscription is priced at **$7.40/month** and provides:
- Unlimited content publishing
- 1000 characters per post
- 5% withdrawal fees (vs 20% on free plan)
- Season 1 Human Badge (permanent)
- Priority support and advanced analytics
- Early access to new features

## Integration Flow

### 1. Frontend - Initiate Payment
When user clicks "Upgrade Now" in EarningsView:

```typescript
// Already implemented in MainApp.tsx
const handleUpgradeToPro = async () => {
  // Call upgrade API to create payment intent
  const response = await fetch('/api/subscriptions/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  })
  
  const { paymentIntentId } = await response.json()
  
  // TODO: Trigger MiniKit World Pay flow
  // See Step 2 below
}
```

### 2. MiniKit World Pay Integration

Add MiniKit payment handling to MainApp.tsx:

```typescript
import { MiniKit } from '@worldcoin/minikit-js'

const handleUpgradeToPro = async () => {
  if (!user || isUpgrading) return
  
  setIsUpgrading(true)
  try {
    // Create payment intent
    const response = await fetch('/api/subscriptions/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })

    if (!response.ok) throw new Error('Failed to initiate upgrade')

    const { paymentIntentId } = await response.json()
    
    // Trigger MiniKit World Pay
    const payment = await MiniKit.commandsAsync.pay({
      reference: paymentIntentId,
      to: process.env.NEXT_PUBLIC_WORLD_PAY_RECIPIENT_ADDRESS!, // Your World Pay recipient address
      tokens: [
        {
          symbol: 'WLD',
          token_amount: '7.40', // $7.40 in WLD (adjust based on exchange rate)
        },
      ],
      description: 'H World Pro - Monthly Subscription',
    })

    if (payment.finalPayload.status === 'success') {
      // Confirm payment on backend
      const confirmResponse = await fetch('/api/subscriptions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          paymentIntentId,
          worldPaymentId: payment.finalPayload.transaction_id,
          plan: 'pro',
        }),
      })

      if (confirmResponse.ok) {
        // Update UI - subscription is now active
        setSubscriptionStatus('pro')
        alert('🎉 Welcome to Pro! Your subscription is now active.')
      }
    } else {
      throw new Error('Payment failed or was cancelled')
    }
    
  } catch (error) {
    console.error('Error upgrading to Pro:', error)
    alert('Payment failed. Please try again.')
  } finally {
    setIsUpgrading(false)
  }
}
```

### 3. Backend APIs

#### Upgrade Endpoint (Already Implemented)
- **Path**: `/api/subscriptions/upgrade`
- **Method**: POST
- **Body**: `{ userId: string }`
- **Returns**: `{ paymentIntentId: string }`
- **Purpose**: Creates a pending subscription record

#### Confirmation Endpoint (Already Implemented)
- **Path**: `/api/subscriptions/confirm`
- **Method**: POST
- **Body**: `{ userId, paymentIntentId, worldPaymentId, plan }`
- **Returns**: `{ success: boolean, subscription: Subscription }`
- **Purpose**: Activates subscription after successful payment

#### Status Endpoint (Already Implemented)
- **Path**: `/api/subscriptions/status`
- **Method**: GET
- **Query**: `?userId=<userId>`
- **Returns**: `{ plan: 'free' | 'pro', status: string, endDate: Date | null }`
- **Purpose**: Check current subscription status

## Environment Variables

Add to your `.env.local`:

```env
# World Pay Configuration
NEXT_PUBLIC_WORLD_PAY_RECIPIENT_ADDRESS="your_world_pay_address_here"
WORLD_PAY_API_KEY="your_api_key_here"

# World ID Configuration (if not already set)
NEXT_PUBLIC_APP_ID="your_world_app_id"
NEXT_PUBLIC_ACTION_ID="your_action_id"
```

## Database Schema

The subscription model is already set up in Prisma:

```prisma
model Subscription {
  id              String   @id @default(cuid())
  userId          String
  plan            String   // 'free' or 'pro'
  status          String   // 'active', 'cancelled', 'expired', 'pending'
  startDate       DateTime @default(now())
  endDate         DateTime?
  worldPaymentId  String?  // World Pay transaction ID
  autoRenew       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
}
```

## Testing

### Test Payment Flow (Development)
1. User clicks "Upgrade Now" on Earnings page
2. Payment intent is created with `pending` status
3. MiniKit payment dialog appears
4. After mock payment (or real in production), confirm endpoint is called
5. Subscription status changes to `active`
6. UI updates to show "Active" badge

### Test Cases
- [ ] Free user can upgrade to Pro
- [ ] Payment intent is created correctly
- [ ] MiniKit payment dialog appears
- [ ] Successful payment activates subscription
- [ ] Failed payment keeps subscription pending
- [ ] Cancelled payment doesn't charge user
- [ ] Pro user sees "Active" badge
- [ ] Subscription features are enabled for Pro users

## Features Controlled by Subscription

Update your app logic to check subscription status:

```typescript
// Example: Check character limit based on plan
const getCharacterLimit = (plan: 'free' | 'pro') => {
  return plan === 'pro' ? 1000 : 280
}

// Example: Check withdrawal fee
const getWithdrawalFee = (plan: 'free' | 'pro') => {
  return plan === 'pro' ? 0.05 : 0.20 // 5% vs 20%
}

// Example: Check post limit
const getPostLimit = (plan: 'free' | 'pro') => {
  return plan === 'pro' ? Infinity : 10 // Unlimited vs 10 per day
}
```

## Auto-Renewal (Future Enhancement)

For auto-renewal, you'll need to:
1. Set up a cron job to check expiring subscriptions
2. Trigger World Pay payment 24 hours before expiration
3. Update subscription `endDate` if successful
4. Send notification to user

Example cron endpoint:

```typescript
// /api/subscriptions/renew-check (run daily)
export async function GET() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const expiringSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      autoRenew: true,
      endDate: { lte: tomorrow },
    },
  })
  
  // Process renewals...
}
```

## Webhooks (Optional)

If World Pay supports webhooks, set up an endpoint to handle payment confirmations:

```typescript
// /api/webhooks/world-pay
export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-worldpay-signature')
  const body = await req.json()
  
  // Verify signature
  // Process payment confirmation
  // Update subscription status
}
```

## Next Steps

1. ✅ Backend APIs implemented
2. ✅ Database schema created
3. ✅ Frontend payment initiation ready
4. 🔄 Add MiniKit World Pay integration (Step 2 above)
5. ⏳ Test payment flow end-to-end
6. ⏳ Add subscription feature gates
7. ⏳ Implement auto-renewal (optional)

## Resources

- [MiniKit Documentation](https://docs.worldcoin.org/minikit)
- [World Pay Documentation](https://docs.worldcoin.org/world-pay)
- [H World Subscription API](./API_DOCUMENTATION.md)
