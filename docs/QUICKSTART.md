# Quick Start: WLD Balance Feature

## 🚀 What's New

The earnings section now displays:
1. ✅ User's wallet address (shortened with copy button)
2. ✅ Real-time $WLD token balance
3. ✅ USD value of WLD holdings
4. ✅ Auto-refresh every 30 seconds
5. ✅ Manual refresh button

## 📂 Files Changed

### New Files
- `/src/lib/wld-balance.ts` - Core balance fetching utility
- `/WLD_BALANCE_INTEGRATION.md` - Detailed technical documentation
- `/IMPLEMENTATION_SUMMARY.md` - Complete implementation overview

### Modified Files
- `/src/components/layout/MainApp.tsx` - Updated EarningsView component

## 🔧 How to Test

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to App
- Open http://localhost:3000
- Log in with World ID or wallet authentication
- Navigate to "Earnings" tab (bottom navigation)

### 3. What You Should See

**If wallet is connected:**
- Shortened wallet address (e.g., `0x1234...5678`) with copy button
- WLD balance display (will show 0.0000 if no tokens)
- USD value (e.g., "≈ $0.00")
- Refresh button

**If wallet is not connected:**
- "Not connected" message
- Withdraw button disabled

### 4. Test Scenarios

✅ **Copy Wallet Address**: Click 📋 button → Should show ✓ briefly
✅ **Manual Refresh**: Click "Refresh" button → Should reload balance
✅ **Auto-refresh**: Wait 30+ seconds → Should update automatically
✅ **Loading State**: Watch for spinner during fetch

## 🐛 Debugging

### Check Console Logs

Look for these messages:
```
🔍 Fetching WLD balance for: 0x...
💵 WLD Price: $2.50
✅ WLD Balance: { wld: '0.0000', usd: '0.00' }
```

### Common Issues

**Balance shows 0 but you have WLD:**
- Check if wallet address is correct
- Verify WLD token contract address in `/src/lib/wld-balance.ts`
- Check Worldchain RPC endpoint is accessible

**Price stuck at $2.50:**
- This is the fallback price when CoinGecko API is unavailable
- Check network connectivity
- CoinGecko may have rate limits (10-30 calls/min on free tier)

**"Loading..." never finishes:**
- Check browser console for errors
- Verify RPC endpoint in wld-balance.ts
- Network tab in DevTools for failed requests

## ⚙️ Configuration

### Required (Before Production)

1. **Verify WLD Token Contract Address**
   - Located in: `/src/lib/wld-balance.ts`
   - Current: `0x2cFc85d8E48F8EAB294be644d9E25C3030863003`
   - **Action**: Confirm this matches Worldchain mainnet WLD contract

2. **RPC Endpoint** (Optional but Recommended)
   - Current: Public Alchemy endpoint
   - For production: Use private API key
   - Set environment variable: `NEXT_PUBLIC_WORLDCHAIN_RPC`

### Optional Improvements

1. **Backend API for Balance Fetching**
   - Move RPC calls to backend for better security
   - Implement caching to reduce API calls
   - Better rate limit management

2. **Price Caching**
   - Cache WLD price globally for all users
   - Update less frequently (e.g., every 5 minutes)
   - Reduces CoinGecko API calls

## 📊 Performance

- **Initial Load**: ~1-2 seconds to fetch balance + price
- **Auto-refresh**: Every 30 seconds
- **Manual Refresh**: Instant trigger, 1-2 seconds to complete

## 🔒 Security

✅ **Safe Practices Used**:
- Only public wallet address used (no private keys)
- Read-only blockchain queries
- Error handling prevents crashes
- No sensitive data exposed

⚠️ **Production Recommendations**:
- Move RPC calls to backend API
- Implement rate limiting per user
- Add request validation and sanitization

## 🎯 Next Steps

1. **Test with Real Wallet**
   - Connect wallet with actual WLD balance
   - Verify correct amount displays
   - Test refresh functionality

2. **Verify Contract Address**
   - Confirm WLD token contract on Worldchain
   - Update if necessary in `/src/lib/wld-balance.ts`

3. **Deploy to Staging**
   - Test in staging environment
   - Monitor for RPC errors or rate limits
   - Verify price feed is working

4. **Production Deployment**
   - Set up private RPC endpoint (recommended)
   - Consider backend API for balance fetching
   - Monitor performance and errors

## 📚 Documentation

- **Technical Details**: See `WLD_BALANCE_INTEGRATION.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`
- **Code Comments**: Check inline comments in `/src/lib/wld-balance.ts`

## 💡 Tips

- Balance refreshes automatically - users don't need to refresh manually
- Shortened address prevents UI overflow on mobile
- Copy button provides good UX for sharing address
- Loading states prevent user confusion
- Graceful fallbacks ensure app never crashes

## 🆘 Getting Help

If you encounter issues:
1. Check browser console for error messages
2. Review the detailed docs in `WLD_BALANCE_INTEGRATION.md`
3. Verify all configuration in `/src/lib/wld-balance.ts`
4. Test RPC endpoint accessibility with curl or Postman

## ✅ Status

**Current**: Implementation complete, ready for testing
**Next**: Test with real wallet and verify contract address
**Then**: Deploy to staging for production testing

---

**Happy coding! 🚀**
