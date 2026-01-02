# Payment & Wallet Updates

## Changes Made

### 1. Removed "Withdraw Earnings" Button ✅

**File**: `/src/components/layout/MainApp.tsx`

**Change**: Removed the "Withdraw Earnings" button from the Connected Wallet section in the Earnings view.

**Before**:
```tsx
{/* WLD Balance Section */}
{user?.walletAddress && (
  <div className="mb-4 p-4 bg-black/40 rounded-xl border border-gray-800">
    {/* Balance display */}
  </div>
)}

<button className="w-full text-black font-bold rounded-full py-4">
  {user?.walletAddress ? 'Withdraw Earnings' : 'Connect Wallet to Withdraw'}
</button>
```

**After**:
```tsx
{/* WLD Balance Section */}
{user?.walletAddress && (
  <div className="p-4 bg-black/40 rounded-xl border border-gray-800">
    {/* Balance display - no button below */}
  </div>
)}
```

**Result**: 
- Cleaner UI in the wallet section
- WLD balance display remains with refresh button
- No withdrawal button (can be re-added later with actual withdrawal logic)

---

### 2. Fixed "Upgrade Now" Payment Flow ✅

**File**: `/src/components/layout/MainApp.tsx`

**Change**: Completely rewrote the `handleUpgradeToPro` function to properly use Worldcoin's Pay API.

#### Implementation Details

**Payment Configuration**:
- **Amount**: $7.40 USD
- **Recipient Address**: `0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9`
- **Supported Tokens**: WLD and USDC
- **Description**: "H World Pro Subscription - Monthly ($7.40)"

**Token Conversion**:
- **WLD**: $7.40 ÷ $2.50 (estimated price) = ~2.96 WLD
- **USDC**: $7.40 = 7.40 USDC (1:1 with USD)

#### Payment Flow

```typescript
handleUpgradeToPro():
  1. Check if MiniKit is installed (World App required)
  2. Generate unique payment reference (UUID without hyphens)
  3. Create payment payload with:
     - Reference ID
     - Recipient address
     - Token amounts (WLD + USDC options)
     - Description
  4. Send payment command via MiniKit.commandsAsync.pay()
  5. Handle response:
     - Success: Update UI, confirm on backend (optional)
     - Error/Cancelled: Show error message
  6. Update subscription status to 'pro'
```

#### Code Example

```typescript
const { MiniKit, tokenToDecimals, Tokens } = await import('@worldcoin/minikit-js')

// Generate unique reference
const paymentReference = crypto.randomUUID().replace(/-/g, '')

// Create payment payload
const payload = {
  reference: paymentReference,
  to: '0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9',
  tokens: [
    {
      symbol: Tokens.WLD,
      token_amount: tokenToDecimals(2.96, Tokens.WLD).toString(),
    },
    {
      symbol: Tokens.USDC,
      token_amount: tokenToDecimals(7.40, Tokens.USDC).toString(),
    },
  ],
  description: 'H World Pro Subscription - Monthly ($7.40)',
}

// Send payment
const { finalPayload } = await MiniKit.commandsAsync.pay(payload)

if (finalPayload.status === 'success') {
  // Payment successful!
  setSubscriptionStatus('pro')
}
```

---

### 3. Updated WorldPay Library ✅

**File**: `/src/lib/worldpay.ts`

**Changes**:
1. Updated default recipient address to `0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9`
2. Fixed token amount conversion using `tokenToDecimals()`
3. Improved USD to token conversion logic

**Before**:
```typescript
to: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || '0x0000000000000000000000000000000000000000',
tokens: [
  {
    symbol: Tokens.WLD,
    token_amount: amount.toString(), // WRONG: Not converted
  },
]
```

**After**:
```typescript
const { tokenToDecimals } = await import('@worldcoin/minikit-js')

to: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || '0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9',
tokens: [
  {
    symbol: Tokens.WLD,
    token_amount: tokenToDecimals(amount / 2.5, Tokens.WLD).toString(), // CORRECT: Properly converted
  },
  {
    symbol: Tokens.USDC,
    token_amount: tokenToDecimals(amount, Tokens.USDC).toString(), // 1:1 with USD
  },
]
```

---

## Testing Instructions

### Test "Upgrade Now" Payment

1. **Prerequisites**:
   - Must be running in World App (MiniKit.isInstalled() returns true)
   - User must have sufficient WLD or USDC balance
   - Recipient address must be whitelisted in Developer Portal

2. **Test Steps**:
   ```
   1. Open app in World App
   2. Navigate to Earnings tab
   3. Scroll to "Creator Plans" section
   4. Click "Upgrade Now" on Pro Creator plan
   5. Verify payment drawer appears in World App
   6. Approve payment with WLD or USDC
   7. Verify success message appears
   8. Verify subscription status updates to "Pro"
   ```

3. **Expected Behavior**:
   - Payment drawer shows: "$7.40 USD equivalent"
   - User can choose WLD or USDC
   - Transaction is sent to `0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9`
   - On success: UI updates, "Active" badge appears
   - On cancel/error: Error message shown, no charge

4. **Console Logs**:
   ```
   💰 Initiating Pro subscription payment: { amount, reference, to }
   📤 Sending payment command: { payload }
   📨 Payment response: { finalPayload }
   ✅ Payment successful! Transaction ID: xxx
   ```

### Test Wallet Section

1. **Navigate to Earnings tab**
2. **Verify Connected Wallet section shows**:
   - ✅ Shortened wallet address (0x1234...5678)
   - ✅ Copy button (📋) works
   - ✅ WLD Balance display
   - ✅ USD value (≈ $X.XX)
   - ✅ Refresh button
   - ❌ No "Withdraw Earnings" button

---

## Environment Variables

### Optional Configuration

Add to `.env.local`:

```env
# Payment recipient address (defaults to 0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9)
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9

# World App Configuration (for Developer Portal verification)
NEXT_PUBLIC_APP_ID=your_app_id
DEV_PORTAL_API_KEY=your_api_key
```

---

## Security Considerations

### Payment Verification

The current implementation optimistically accepts payments. For production:

1. **Backend Verification** (Recommended):
   ```typescript
   // Call Developer Portal API to verify transaction
   const response = await fetch(
     `https://developer.worldcoin.org/api/v2/minikit/transaction/${transaction_id}?app_id=${APP_ID}`,
     {
       headers: {
         Authorization: `Bearer ${DEV_PORTAL_API_KEY}`,
       },
     }
   )
   ```

2. **On-Chain Verification** (Advanced):
   ```typescript
   // Listen for TransferReference event
   event TransferReference(
     address sender,
     address indexed recipient,
     uint256 amount,
     address token,
     string indexed referenceId,
     bool indexed success
   )
   ```

### Recipient Address Whitelisting

**Important**: Whitelist `0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9` in the [Developer Portal](https://developer.worldcoin.org/):

1. Go to Developer Portal
2. Navigate to your app settings
3. Add recipient address to whitelist
4. (Optional) Disable whitelist check for testing

---

## Token Price Considerations

### Current Implementation

- **WLD Price**: Hardcoded at ~$2.50 per WLD
- **USDC Price**: 1:1 with USD (stable)

### Recommended Improvements

1. **Fetch Real-Time WLD Price**:
   ```typescript
   // Use Worldcoin's price API
   const response = await fetch('https://developer.worldcoin.org/api/v1/prices')
   const { wld_usd } = await response.json()
   const wldAmount = usdAmount / wld_usd
   ```

2. **Dynamic Token Amounts**:
   ```typescript
   const wldPrice = await fetchWLDPrice() // Real-time price
   const payload = {
     tokens: [
       {
         symbol: Tokens.WLD,
         token_amount: tokenToDecimals(7.40 / wldPrice, Tokens.WLD).toString(),
       },
       {
         symbol: Tokens.USDC,
         token_amount: tokenToDecimals(7.40, Tokens.USDC).toString(),
       },
     ],
   }
   ```

---

## API Endpoints

### Backend Confirmation (Optional)

**Endpoint**: `/api/subscriptions/confirm`

**Purpose**: Store payment records and update user subscription status

**Request**:
```typescript
POST /api/subscriptions/confirm
{
  userId: string
  reference: string
  transactionId: string
  status: string
}
```

**Response**:
```typescript
{
  success: boolean
  subscription?: {
    id: string
    userId: string
    plan: 'pro'
    status: 'active'
    transactionId: string
  }
}
```

---

## Troubleshooting

### Payment Fails

**Issue**: Payment command returns error or cancelled

**Possible Causes**:
1. Not running in World App (MiniKit.isInstalled() = false)
2. Insufficient balance (WLD or USDC)
3. Recipient address not whitelisted
4. Network issues
5. User cancelled transaction

**Solutions**:
- Check console logs for detailed error messages
- Verify World App is being used
- Check user balance in World App wallet
- Whitelist recipient address in Developer Portal
- Ensure stable internet connection

### Transaction Shows as Pending

**Issue**: Transaction stuck in pending state

**Solution**:
- On-chain transactions can take a few minutes
- Poll Developer Portal API for status updates
- Show pending UI to user with transaction ID

### Wrong Token Amount

**Issue**: Payment amount doesn't match expected value

**Solution**:
- Verify WLD price assumption (~$2.50)
- Check tokenToDecimals() is being used
- Update WLD amount calculation with real-time price

---

## Migration Notes

### From Old Implementation

**Old Flow**:
1. Call `/api/subscriptions/upgrade` → Get payment intent
2. Use `initiateWorldPayment()` helper
3. Use `generatePaymentReference()` helper
4. Call `/api/subscriptions/confirm`

**New Flow**:
1. Generate reference directly with `crypto.randomUUID()`
2. Call MiniKit.commandsAsync.pay() directly
3. (Optional) Confirm on backend

**Benefits**:
- Simpler, more direct integration
- Follows official Worldcoin documentation
- Better error handling
- More transparent payment flow

---

## Summary

✅ **Completed Tasks**:
1. Removed "Withdraw Earnings" button from wallet section
2. Fixed "Upgrade Now" to use proper Worldcoin Pay API
3. Updated payment recipient to `0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9`
4. Implemented correct token amount conversion
5. Added comprehensive error handling
6. Updated WorldPay library with proper defaults

✅ **No TypeScript Errors**

✅ **Ready for Testing in World App**

---

**Status**: Complete
**Date**: December 2024
**Requires**: World App, sufficient WLD/USDC balance, whitelisted recipient address
