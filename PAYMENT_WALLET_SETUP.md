# Setting Up Payment Recipient Wallet for World Pay

## Overview

To receive payments from Pro subscriptions, you need to set up a wallet address that will receive World tokens (WLD) and USDC payments through the World Pay system.

## Step-by-Step Setup

### 1. Choose a Wallet

You need an Ethereum-compatible wallet that supports the **Optimism network**. Recommended options:

#### Option A: MetaMask (Recommended)
- Download: https://metamask.io/
- Easy to use and widely supported
- Works on desktop and mobile

#### Option B: Rainbow Wallet
- Download: https://rainbow.me/
- User-friendly mobile wallet
- Native World App integration

#### Option C: Coinbase Wallet
- Download: https://www.coinbase.com/wallet
- Good for beginners
- Built-in token swaps

### 2. Create/Import Your Wallet

**New Wallet:**
1. Download your chosen wallet app
2. Click "Create new wallet"
3. **IMPORTANT**: Write down your recovery phrase
4. Store recovery phrase securely (never share it!)
5. Set up wallet password/PIN

**Existing Wallet:**
1. Open your wallet app
2. You can use your existing Ethereum address
3. Ensure it supports Optimism network

### 3. Add Optimism Network

World Pay uses the Optimism network. Add it to your wallet:

**Automatic (MetaMask):**
1. Go to https://chainlist.org
2. Search for "Optimism"
3. Click "Add to MetaMask"

**Manual Configuration:**
```
Network Name: Optimism
RPC URL: https://mainnet.optimism.io
Chain ID: 10
Currency Symbol: ETH
Block Explorer: https://optimistic.etherscan.io
```

### 4. Get Your Wallet Address

1. Open your wallet
2. Switch to Optimism network
3. Copy your wallet address (starts with "0x...")
4. It looks like: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### 5. Add Address to Environment Variables

Open your `.env.local` file and add:

```bash
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0xYourActualWalletAddressHere
```

**Example:**
```bash
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### 6. Verify Configuration

Run this command to check your configuration:
```bash
npm run dev
```

Check the console for:
```
✅ Payment recipient configured: 0x742d35...
```

## Security Best Practices

### ✅ DO:
- Use a dedicated wallet for business/merchant payments
- Store recovery phrase in multiple secure locations
- Use hardware wallet for large amounts
- Enable 2FA on wallet apps that support it
- Regularly backup wallet information
- Use different wallets for testing and production

### ❌ DON'T:
- Share your recovery phrase with anyone
- Store recovery phrase digitally (avoid screenshots, cloud storage)
- Use the same wallet for personal and business
- Commit wallet addresses to public GitHub repos
- Share private keys
- Use test wallet addresses in production

## Testing Your Setup

### Test Payment Flow (Development)

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Open in World App:**
   - Generate QR code or use World App simulator
   - Navigate to Earnings page
   - Click "Upgrade Now"

3. **Initiate test payment:**
   - Should see payment prompt in World App
   - Use test tokens (if in dev mode)
   - Confirm payment

4. **Verify receipt:**
   - Check your wallet on Optimism network
   - Should see WLD or USDC tokens
   - Verify in Optimism block explorer

### Production Testing

**Before going live:**
1. Test with small payment first ($1)
2. Verify payment appears in wallet
3. Test payment confirmation flow
4. Test subscription activation
5. Test feature gates work correctly

## Supported Tokens

Your wallet will receive payments in:

### 1. WLD (World Token)
- Native token of Worldcoin ecosystem
- Primary payment method
- Can be swapped to other tokens

### 2. USDC (USD Coin)
- Stablecoin pegged to USD
- Secondary payment option
- Easy to convert to fiat

## Managing Received Payments

### View Payments

**In Wallet:**
1. Open wallet app
2. Switch to Optimism network
3. View WLD and USDC balances
4. Check transaction history

**On Block Explorer:**
1. Go to https://optimistic.etherscan.io
2. Enter your wallet address
3. View all transactions
4. See payment details

### Withdraw/Convert Funds

**To Bank Account:**
1. Transfer WLD/USDC to exchange (Coinbase, Binance, etc.)
2. Sell for fiat currency
3. Withdraw to bank account

**To Other Tokens:**
1. Use swap services (Uniswap, 1inch)
2. Swap WLD/USDC to ETH, USDT, etc.
3. Or keep in wallet for future use

## Troubleshooting

### Issue: "Payment Recipient Address Not Configured"
**Solution:** Add wallet address to `.env.local` file

### Issue: "Payments Not Appearing"
**Solutions:**
- Check you're viewing Optimism network (not Ethereum mainnet)
- Wait for transaction confirmation (1-2 minutes)
- Verify address in block explorer
- Check transaction hash from payment

### Issue: "Invalid Address Format"
**Solutions:**
- Ensure address starts with "0x"
- Address should be 42 characters long
- No spaces or special characters
- Copy address directly from wallet

### Issue: "Can't See WLD/USDC Tokens"
**Solution:** Add token contracts to wallet:

**WLD Token on Optimism:**
```
Contract: 0xdc6fF44d5d932Cbd77B52E5612Ba0529DC6226F1
Symbol: WLD
Decimals: 18
```

**USDC Token on Optimism:**
```
Contract: 0x7F5c764cBc14f9669B88837ca1490cCa17c31607
Symbol: USDC
Decimals: 6
```

## Multi-Wallet Setup

For better organization, consider:

### Development Wallet
- Use for testing
- Can be public
- Fund with test tokens

### Production Wallet  
- Use for real payments
- Keep private and secure
- Use hardware wallet

### Hot Wallet (Operational)
- Receives daily payments
- Regular withdrawals
- Limited funds

### Cold Wallet (Storage)
- Long-term storage
- Offline/hardware wallet
- Bulk of funds

## Payment Monitoring

### Set Up Notifications

**Option 1: Block Explorer Alerts**
1. Go to Optimistic Etherscan
2. Create account
3. Add address to watch list
4. Enable email notifications

**Option 2: Wallet Notifications**
- Enable push notifications in wallet app
- Get alerts for incoming transactions
- Monitor in real-time

**Option 3: Custom Monitoring**
```typescript
// Add webhook listener for payment confirmations
// /api/webhooks/payment-received
```

## Tax Considerations

**Important:** Cryptocurrency payments may be taxable in your jurisdiction.

**Track:**
- Payment amounts in USD
- Transaction dates and times
- Transaction hashes
- Fees paid

**Consult:**
- Tax professional familiar with crypto
- Local tax regulations
- Keep detailed records

## Additional Resources

- **MetaMask Guide**: https://metamask.io/faqs/
- **Optimism Docs**: https://community.optimism.io/
- **World Token Info**: https://worldcoin.org/
- **Optimism Explorer**: https://optimistic.etherscan.io/

## Support

Need help setting up your wallet?
- Email: support@hworld.app
- Discord: [Your Discord Link]
- Documentation: https://docs.hworld.app

## Next Steps

After setting up your wallet:
1. ✅ Configure wallet address in `.env.local`
2. ✅ Test payment flow in development
3. ✅ Set up payment notifications
4. ✅ Plan withdrawal strategy
5. ✅ Deploy to production
6. ✅ Monitor first payments

---

**Remember**: Your wallet security is your responsibility. Never share your private keys or recovery phrase!
