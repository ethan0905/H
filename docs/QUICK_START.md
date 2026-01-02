# Quick Start Guide - H World MiniKit Integration

This guide will get you up and running with the H World Pro subscription and payment system.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies (if not already done)
```bash
npm install
```

### Step 2: Configure Payment Wallet
1. Create or use existing Ethereum wallet (MetaMask, Rainbow, etc.)
2. Get your wallet address (starts with "0x...")
3. Add to `.env.local`:
```bash
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0xYourWalletAddressHere
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Test the App
Open http://localhost:3000 in your browser

## ✅ What's Already Working

### 1. Communities ✅
- Navigate to "Communities" tab
- See 5 pre-seeded communities
- Join/leave communities
- Membership saves to database
- View community feeds

### 2. Subscription System ✅
- Navigate to "Earnings" tab
- See Free vs Pro plan comparison
- Click "Upgrade Now" button
- Payment flow initiates (requires World App)

### 3. Feature Gates ✅
- **Post Limits**: Free users limited to 10 posts/day
- **Character Limits**: Free 280 chars, Pro 1000 chars
- **Fees**: Free 20%, Pro 5%
- Limits enforced in real-time

### 4. Payment Processing ✅
- World Pay SDK integrated
- Payment intents created
- Transaction confirmation ready
- Error handling in place

## 🧪 Testing Features

### Test Communities
```bash
# Communities are already seeded!
# Just navigate to Communities tab and try:
# 1. Join a community
# 2. Leave a community
# 3. Check membership persists on refresh
```

### Test Subscription Limits (Free Plan)
```bash
# 1. Go to home feed
# 2. Create 10 posts
# 3. Try to create 11th post - should be blocked!
# 4. See upgrade prompt
```

### Test Character Limits
```bash
# 1. Start composing a post
# 2. Free plan: Limited to 280 characters
# 3. Pro plan: Can use up to 1000 characters
# 4. Counter shows remaining characters
```

### Test Payment Flow (Requires World App)
```bash
# 1. Open app in World App (not browser)
# 2. Navigate to Earnings tab
# 3. Click "Upgrade Now" on Pro plan
# 4. Confirm payment in World App
# 5. Subscription activates automatically
```

## 📁 Key Files

### Utilities
- `/src/lib/worldpay.ts` - Payment processing
- `/src/lib/subscription-features.ts` - Feature gates

### Components
- `/src/components/layout/MainApp.tsx` - Main app with Earnings view
- `/src/components/tweet/ComposeTweet.tsx` - Post composer with limits

### API Routes
- `/src/app/api/communities/route.ts` - Community list
- `/src/app/api/communities/join/route.ts` - Join community
- `/src/app/api/communities/leave/route.ts` - Leave community
- `/src/app/api/subscriptions/status/route.ts` - Subscription status
- `/src/app/api/subscriptions/upgrade/route.ts` - Initiate upgrade
- `/src/app/api/subscriptions/confirm/route.ts` - Confirm payment

### Database
- `/prisma/schema.prisma` - Database schema
- `/prisma/dev.db` - SQLite database (seeded)

## 🎯 Quick Feature Overview

### Free Plan
- ❌ 10 posts per day
- ❌ 280 characters per post
- ❌ 20% withdrawal fees
- ❌ Basic features only

### Pro Plan ($7.40/month)
- ✅ Unlimited posts
- ✅ 1000 characters per post
- ✅ 5% withdrawal fees (75% savings!)
- ✅ Priority support
- ✅ Advanced analytics
- ✅ Pro badge
- ✅ Season 1 Human Badge
- ✅ Early access to features

## 🔧 Common Tasks

### Check Subscription Status
```typescript
// API call
fetch('/api/subscriptions/status')
  .then(res => res.json())
  .then(data => console.log(data.plan)) // 'free' or 'pro'
```

### Check Community Membership
```typescript
// API call
fetch('/api/communities')
  .then(res => res.json())
  .then(data => console.log(data.communities))
  // Each community has 'isJoined' property
```

### Calculate Withdrawal Fees
```typescript
import { calculateWithdrawalFee } from '@/lib/subscription-features'

const amount = 100
const freeFee = calculateWithdrawalFee('free', amount) // $20
const proFee = calculateWithdrawalFee('pro', amount) // $5
```

## 📊 Testing Checklist

### Communities
- [ ] Can view all communities
- [ ] Can join a community
- [ ] Can leave a community
- [ ] Membership persists after refresh
- [ ] Member count updates correctly

### Subscriptions
- [ ] Can view subscription status
- [ ] Free plan shows correct limits
- [ ] Pro plan shows "Active" badge
- [ ] Upgrade button works
- [ ] Payment intent is created

### Feature Gates
- [ ] Post limit enforced (Free: 10/day)
- [ ] Character limit enforced (Free: 280, Pro: 1000)
- [ ] Upgrade prompts appear when limited
- [ ] Pro users see unlimited features
- [ ] Limits reset daily

## 🐛 Troubleshooting

### "Payment Recipient Address Not Configured"
- Add your wallet address to `.env.local`
- Restart dev server

### "Failed to fetch communities"
- Check database exists: `ls prisma/dev.db`
- Run migrations: `npx prisma migrate dev`
- Seed database: `npm run seed:full`

### "Can't test payment in browser"
- Payments require World App
- Generate QR code to open in World App
- Or use World App simulator

### "Subscription status not updating"
- Check API endpoint is running
- Check console for errors
- Verify database has Subscription table

## 🚀 Next Steps

### 1. Test Everything Locally ✅
- [x] Communities working
- [x] Subscription status showing
- [x] Feature gates enforced
- [ ] Payment flow tested (need World App)

### 2. Configure Production Wallet
- [ ] Set up merchant wallet
- [ ] Add production wallet address
- [ ] Test with small payment first

### 3. Deploy to Production
- [ ] Set up hosting (Vercel, Railway, etc.)
- [ ] Configure production database
- [ ] Set environment variables
- [ ] Deploy!

### 4. Monitor & Improve
- [ ] Track conversion rates
- [ ] Monitor payment success
- [ ] Gather user feedback
- [ ] Iterate on features

## 📚 Full Documentation

For detailed information, see:
- `MINIKIT_WORLDPAY_INTEGRATION.md` - Complete payment guide
- `PAYMENT_WALLET_SETUP.md` - Wallet configuration
- `PROJECT_STATUS_COMPLETE.md` - Project overview
- `INTEGRATION_COMPLETE.md` - Integration summary

## 💬 Need Help?

1. Check documentation files above
2. Review console logs for errors
3. Check API responses in Network tab
4. Verify environment variables are set

## ✨ You're Ready!

Everything is set up and working. The only thing needed for production is configuring your payment recipient wallet address and testing the payment flow in World App.

**Happy coding! 🎉**
