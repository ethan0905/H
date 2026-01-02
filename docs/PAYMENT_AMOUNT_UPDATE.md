# Payment Amount Update - 0.01 WLD

## Change Made
Updated the Pro subscription payment from **740 WLD** to **0.01 WLD** for testing.

## Previous Logic
- WLD Price: $0.01
- Subscription: $7.40
- Calculation: $7.40 / $0.01 = **740 WLD**

## New Logic (Fixed Amount)
- **Fixed: 0.01 WLD** regardless of subscription price
- **Fixed: 0.01 USDC** as alternative
- Makes testing much more affordable!

## Files Modified

### 1. `/src/components/layout/MainApp.tsx`
```typescript
// Before
const WLD_PRICE_USD = 0.01
token_amount: tokenToDecimals(7.40 / WLD_PRICE_USD, Tokens.WLD).toString() // 740 WLD

// After
token_amount: tokenToDecimals(0.01, Tokens.WLD).toString() // 0.01 WLD
```

### 2. `/src/lib/worldpay.ts`
```typescript
// Before
const WLD_PRICE_USD = 0.01
token_amount: tokenToDecimals(amount / WLD_PRICE_USD, Tokens.WLD).toString()

// After
token_amount: tokenToDecimals(0.01, Tokens.WLD).toString() // 0.01 WLD fixed
```

## Payment Details Now

When clicking "Upgrade Now":
- **Amount**: 0.01 WLD (or 0.01 USDC)
- **Recipient**: 0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9
- **Description**: "H World Pro Subscription - Monthly (Testing: 0.01 WLD)"

## Testing
User will see in World App:
```
Pay 0.01 WLD
to 0x3ffd...1fc9
```

Much easier to test! 🎉

## Production Note
To change back to production pricing, update both files to calculate based on actual WLD market price:
```typescript
const WLD_PRICE_USD = 2.50 // Production price
token_amount: tokenToDecimals(7.40 / WLD_PRICE_USD, Tokens.WLD).toString()
```
