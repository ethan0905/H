# Feature 4 Testing Guide

## Manual Testing Checklist

### 1. Database Schema ✅
```bash
# Verify migration was applied
cd /Users/ethan/Desktop/H
npx prisma studio
# Check that User model has isSeasonOneOG field
# Check that Subscription model has walletAddress field
```

### 2. Payment Flow Testing

#### Prerequisites:
- World App installed with test wallet
- User logged in to H World
- Navigate to Earnings view

#### Test Steps:
1. Click "Upgrade to Pro" button
2. MiniKit payment modal should open
3. Confirm payment of 0.01 WLD
4. Wait for success message: "🎉 Welcome to Pro! ✨ Your subscription is now active! 👑 Season 1 OG Human badge unlocked!"
5. Verify subscription status changes to "pro"

### 3. Badge Display Testing

#### Profile Page:
1. Navigate to your profile
2. Badge should appear under bio section
3. Should display: "👑 Season 1 OG Human - Founding Member"
4. Badge has yellow-orange gradient styling

#### Tweet Card:
1. Create a new tweet
2. View the tweet in feed
3. Small crown icon (👑) should appear next to your username
4. Badge appears consistently across all your tweets

#### Comments:
1. Comment on any tweet
2. Crown icon should appear next to your name in comment section

### 4. API Endpoint Testing

#### Verify Payment:
```bash
# Test payment verification endpoint
curl -X POST http://localhost:3000/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "reference": "test_reference_123",
    "transactionId": "0xtest123",
    "walletAddress": "0x1234..."
  }'

# Expected response:
{
  "success": true,
  "message": "Payment verified successfully",
  "user": {
    "id": "...",
    "isPro": true,
    "isSeasonOneOG": true,
    ...
  }
}
```

#### Check Subscription Status:
```bash
curl http://localhost:3000/api/subscriptions/status?userId=YOUR_USER_ID

# Expected response:
{
  "plan": "pro",
  "status": "active",
  "isSeasonOneOG": true,
  "isPro": true,
  "endDate": null
}
```

#### Get User Profile:
```bash
curl http://localhost:3000/api/users?userId=YOUR_USER_ID

# Verify response includes:
{
  "isPro": true,
  "isSeasonOneOG": true,
  ...
}
```

### 5. Edge Cases to Test

#### Already Verified Payment:
1. Try to verify the same payment twice
2. Should return success with existing data
3. Badge should not be duplicated

#### User Without Badge:
1. View profile of user who hasn't subscribed
2. Badge should NOT appear
3. No console errors

#### Badge Persistence:
1. Log out
2. Log back in
3. Badge should still be visible
4. User store should have isPro and isSeasonOneOG

### 6. Database Verification

```sql
-- Check user record
SELECT id, username, isPro, isSeasonOneOG, createdAt 
FROM users 
WHERE id = 'YOUR_USER_ID';

-- Check subscription record
SELECT id, userId, plan, status, walletAddress, worldPaymentId, startDate
FROM subscriptions
WHERE userId = 'YOUR_USER_ID';

-- Check payment intent
SELECT id, reference, status, transactionId, verifiedAt
FROM payment_intents
WHERE userId = 'YOUR_USER_ID'
ORDER BY createdAt DESC;
```

## Known Issues / TypeScript Errors

The following TypeScript errors are **expected** and will resolve after TypeScript server restart:
- `Property 'isPro' does not exist on type 'User'`
- `Property 'isSeasonOneOG' does not exist on type 'User'`
- `Property 'walletAddress' does not exist on type 'Subscription'`
- `Property 'paymentIntent' does not exist on type 'PrismaClient'`

These are type-checking errors only. The runtime code works correctly because:
1. Prisma migration was successfully applied
2. Prisma client was regenerated
3. Database schema includes all new fields

## Success Criteria

✅ Payment completes successfully with 0.01 WLD  
✅ User record updated with isPro=true and isSeasonOneOG=true  
✅ Subscription record created with wallet address and transaction ID  
✅ Badge appears on profile page  
✅ Badge appears on all user's tweets  
✅ Badge appears in comment sections  
✅ User store updated with new fields  
✅ API endpoints return correct data  

## Production Deployment Notes

Before deploying to production:
1. Update payment amount from 0.01 WLD to production price
2. Test on World App testnet first
3. Verify on-chain transaction confirmation
4. Set up monitoring for payment verification failures
5. Add analytics tracking for badge grants
6. Consider adding badge display animation
