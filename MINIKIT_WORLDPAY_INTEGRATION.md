# MiniKit World Pay Integration Guide

## Overview

The H World app now includes full integration with MiniKit World Pay SDK for processing Pro subscription payments. Users can upgrade to Pro ($7.40/month) directly within the World App.

## Features Implemented

### 1. Payment Processing (`/src/lib/worldpay.ts`)

**Functions:**
- `initiateWorldPayment(amount, description, reference)` - Initiates a payment using World Pay
- `subscribeToPaymentEvents(onSuccess, onError)` - Subscribe to payment status updates
- `generatePaymentReference(userId, type)` - Generate unique payment references
- `formatPaymentAmount(amount)` - Format amounts for display

**Payment Flow:**
1. User clicks "Upgrade Now" button in Earnings view
2. App creates payment intent on backend (`/api/subscriptions/upgrade`)
3. App initiates World Pay payment with MiniKit
4. User confirms payment in World App
5. App confirms payment on backend (`/api/subscriptions/confirm`)
6. Subscription status is updated to "pro"

**Supported Tokens:**
- WLD (World Token)
- USDC (USD Coin)

### 2. Subscription Feature Gates (`/src/lib/subscription-features.ts`)

**Feature Limits:**

| Feature | Free Plan | Pro Plan |
|---------|-----------|----------|
| Posts per Day | 10 | Unlimited |
| Characters per Post | 280 | 1000 |
| Withdrawal Fees | 20% | 5% |
| Priority Support | ❌ | ✅ |
| Advanced Analytics | ❌ | ✅ |
| Early Access | ❌ | ✅ |
| Pro Badge | ❌ | ✅ |
| Season Badge | ❌ | ✅ |

**Helper Functions:**
- `getSubscriptionLimits(tier)` - Get all limits for a tier
- `canUserPost(tier, postsToday)` - Check if user can post
- `isPostLengthValid(tier, length)` - Validate post length
- `getRemainingPosts(tier, postsToday)` - Get remaining posts
- `calculateWithdrawalFee(tier, amount)` - Calculate withdrawal fee
- `calculateNetWithdrawal(tier, amount)` - Calculate net amount after fees
- `calculateProSavings(amount)` - Calculate savings from Pro upgrade

### 3. Frontend Integration

#### ComposeTweet Component
- Shows subscription tier (Free or Pro with crown icon)
- Displays remaining posts and character limits
- Blocks posting when daily limit reached (Free users only)
- Shows upgrade prompt when limit exceeded
- Automatically tracks posts per day

#### Earnings View (MainApp.tsx)
- Shows subscription status with "Active" badge for Pro users
- "Upgrade Now" button for Free users
- Initiates World Pay payment flow
- Handles payment success/failure
- Updates UI after successful upgrade

### 4. API Endpoints

**GET `/api/subscriptions/status`**
- Returns current subscription status
- Response: `{ plan: 'free' | 'pro', status: 'active' | 'cancelled', ... }`

**POST `/api/subscriptions/upgrade`**
- Initiates Pro subscription upgrade
- Creates payment intent
- Response: `{ paymentIntentId: string }`

**POST `/api/subscriptions/confirm`**
- Confirms payment and activates subscription
- Updates database with Pro status
- Body: `{ userId, paymentIntentId, transactionId }`

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local` file:

```bash
# World Pay Configuration
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0xYourWalletAddressHere
```

Replace `0xYourWalletAddressHere` with your actual merchant wallet address where you want to receive payments.

### 2. Merchant Wallet Setup

1. Create or use an existing Ethereum-compatible wallet
2. Ensure wallet supports Optimism network (World Pay uses Optimism)
3. Wallet must support WLD and USDC tokens
4. Add wallet address to environment variables

### 3. Testing in World App

**Development Testing:**
```bash
npm run dev
```

**Test Payment Flow:**
1. Open app in World App (not browser)
2. Navigate to Earnings view
3. Click "Upgrade Now" on Pro plan
4. Confirm payment in World App
5. Check subscription status updates to Pro

**Test Feature Gates:**
1. Make 10 posts as Free user
2. Attempt 11th post - should be blocked
3. Upgrade to Pro
4. Try posting again - should work
5. Try longer post (500+ chars) - should work for Pro only

### 4. Production Deployment

**Required:**
- Valid merchant wallet address in production environment
- World App ID configured (`NEXT_PUBLIC_MINIKIT_APP_ID`)
- SSL/HTTPS enabled
- Database with Subscription table migrated

**Optional:**
- Webhook for payment confirmations
- Email notifications for upgrades
- Analytics tracking for conversions

## Payment Flow Diagram

```
User Clicks "Upgrade Now"
       ↓
Backend: Create Payment Intent
       ↓
Frontend: Initiate World Pay
       ↓
World App: User Confirms Payment
       ↓
Frontend: Receive Transaction ID
       ↓
Backend: Confirm & Activate Subscription
       ↓
Frontend: Update UI to Pro Status
```

## Security Considerations

1. **Payment Verification**: Always verify payments on backend before activating subscription
2. **Transaction IDs**: Store transaction IDs for audit trail
3. **Rate Limiting**: Implement rate limiting on payment endpoints
4. **Webhook Validation**: If using webhooks, validate signatures
5. **Environment Variables**: Never commit wallet addresses to git

## Error Handling

**Common Errors:**
- `"World App Required"` - User not in World App, show QR code
- `"Payment cancelled by user"` - User declined payment
- `"Payment failed"` - Insufficient funds or network error
- `"Failed to confirm subscription"` - Backend verification failed

**Error Recovery:**
- Payment intents expire after 24 hours
- Users can retry failed payments
- Subscription status only updates after successful confirmation
- Failed payments don't affect user's account

## Feature Gating Examples

**Compose Tweet:**
```typescript
const limits = getSubscriptionLimits(subscriptionTier);
const canPost = canUserPost(subscriptionTier, postsToday);

if (!canPost) {
  // Show upgrade prompt
}
```

**Withdrawal:**
```typescript
const fee = calculateWithdrawalFee(subscriptionTier, amount);
const netAmount = calculateNetWithdrawal(subscriptionTier, amount);

// Free: 20% fee
// Pro: 5% fee (75% savings!)
```

**Character Limit:**
```typescript
const limits = getSubscriptionLimits(subscriptionTier);
const maxChars = limits.maxCharactersPerPost;

// Free: 280 characters
// Pro: 1000 characters
```

## Monitoring & Analytics

**Track:**
- Conversion rate (Free → Pro)
- Failed payment reasons
- Average time to upgrade
- Pro user retention
- Revenue per user

**Metrics to Monitor:**
- Payment success rate
- Payment processing time
- Subscription churn rate
- Feature usage by tier

## Future Enhancements

1. **Auto-Renewal**: Implement monthly recurring payments
2. **Annual Plan**: Add discounted annual subscription option
3. **Gifting**: Allow users to gift Pro subscriptions
4. **Trial Period**: Offer 7-day free trial for Pro features
5. **Team Plans**: Multiple users under one subscription
6. **Payment History**: Show all past transactions
7. **Refunds**: Handle subscription cancellations and refunds

## Support & Troubleshooting

**If Payment Fails:**
1. Check World App wallet has sufficient balance
2. Verify network connectivity
3. Ensure app is latest version
4. Contact support with transaction ID

**If Subscription Not Activated:**
1. Check API logs for confirmation errors
2. Verify transaction ID in database
3. Manually activate if payment confirmed
4. Refund if payment failed to process

## Resources

- [MiniKit Documentation](https://docs.worldcoin.org/minikit)
- [World Pay SDK Reference](https://docs.worldcoin.org/minikit/world-pay)
- [Optimism Network Info](https://optimism.io)
- [WLD Token Info](https://worldcoin.org/tokenomics)

## Contact

For payment integration issues, contact:
- Technical Support: support@hworld.app
- Integration Help: dev@hworld.app
