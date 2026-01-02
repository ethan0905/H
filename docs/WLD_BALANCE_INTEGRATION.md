# WLD Balance Integration

This document explains how the $WLD balance fetching works in the H World app.

## Overview

The earnings section now displays the user's actual $WLD token balance in real-time by querying the Worldchain blockchain (Optimism-based Layer 2).

## Features

✅ **Real-time Balance**: Automatically fetches WLD balance when wallet is connected
✅ **Auto-refresh**: Balance updates every 30 seconds
✅ **Manual Refresh**: Users can manually refresh their balance with a button click
✅ **USD Conversion**: Shows both WLD amount and estimated USD value
✅ **Price Feed**: Integrates with CoinGecko API for current WLD/USD price
✅ **Wallet Address Display**: Shows shortened address with copy-to-clipboard functionality
✅ **Loading States**: Displays loading indicators while fetching data

## Technical Implementation

### Files Created/Modified

1. **`/src/lib/wld-balance.ts`** (NEW)
   - Core utility for fetching WLD token balance
   - Interfaces with Worldchain RPC endpoint
   - Fetches WLD/USD price from CoinGecko
   - Handles ERC20 token balance queries

2. **`/src/components/layout/MainApp.tsx`** (MODIFIED)
   - Added balance fetching logic in `EarningsView` component
   - Real-time balance display with auto-refresh
   - Manual refresh button
   - Improved wallet address display with copy functionality

### How It Works

1. **Balance Fetching**:
   - Uses standard ERC20 `balanceOf` function call via RPC
   - Queries Worldchain (Optimism L2) blockchain
   - Converts Wei to WLD (18 decimals)

2. **Price Conversion**:
   - Fetches current WLD price from CoinGecko API
   - Falls back to $2.50 if API is unavailable
   - Calculates USD value: `WLD_balance × WLD_price`

3. **Auto-refresh**:
   - Balance refreshes every 30 seconds automatically
   - Cleans up interval on component unmount
   - Refreshes when wallet address changes

## Configuration

### RPC Endpoint

Currently using public Worldchain RPC:
```typescript
const WORLDCHAIN_RPC = 'https://worldchain-mainnet.g.alchemy.com/public'
```

**For production**, consider:
- Using your own Alchemy API key for better rate limits
- Implementing RPC fallback endpoints
- Adding retry logic for failed requests

### WLD Token Contract

The WLD token contract address is defined in `/src/lib/wld-balance.ts`:
```typescript
const WLD_TOKEN_ADDRESS = '0x2cFc85d8E48F8EAB294be644d9E25C3030863003'
```

⚠️ **Important**: Verify this is the correct WLD token contract address on Worldchain mainnet before production deployment.

### Price Feed

Using CoinGecko's free API:
```typescript
https://api.coingecko.com/api/v3/simple/price?ids=worldcoin-wld&vs_currencies=usd
```

**Rate Limits**: CoinGecko free tier allows 10-30 calls/minute.

**Alternatives**:
- Implement price caching on backend
- Use Worldcoin's official price feed if available
- Integrate with DEX price oracles (Uniswap, Curve, etc.)

## Testing

### Test Scenarios

1. ✅ User with no wallet connected → Shows "Not connected"
2. ✅ User with wallet but 0 balance → Shows "0.0000 WLD"
3. ✅ User with WLD balance → Shows actual balance + USD value
4. ✅ Manual refresh → Refetches balance immediately
5. ✅ Copy wallet address → Copies full address to clipboard

### Test Wallets

To test with actual balances, you can:
1. Use a test wallet with WLD on Worldchain testnet
2. Modify the RPC endpoint to point to testnet
3. Verify the contract address is correct for testnet

## Error Handling

The integration includes comprehensive error handling:

- **Invalid wallet address**: Returns error, shows "Not connected"
- **RPC errors**: Logs error, shows 0 balance gracefully
- **Network timeouts**: Retries automatically on next refresh cycle
- **Price feed failure**: Uses fallback price of $2.50
- **Missing data**: Shows loading state or 0 balance, never crashes

## Future Improvements

### Short-term
- [ ] Add balance caching to reduce RPC calls
- [ ] Implement backend API for balance fetching (better security)
- [ ] Add transaction history display
- [ ] Show pending transactions

### Long-term
- [ ] Multi-token support (USDC, ETH, etc.)
- [ ] Portfolio value tracking
- [ ] Historical balance charts
- [ ] Price alerts and notifications
- [ ] Direct withdrawal functionality
- [ ] Gas fee estimation for withdrawals

## Security Considerations

1. **RPC Calls**: Currently made from client-side
   - Consider moving to backend API for production
   - Prevents exposure of RPC endpoints
   - Better rate limit management

2. **Wallet Address**: Never expose private keys
   - Only public address is used for balance queries
   - Read-only operations only

3. **Price Data**: Validate price data before display
   - Implement sanity checks (e.g., price > $0.01 and < $100)
   - Fallback to cached price if validation fails

## Support

For issues or questions:
- Check console logs for error messages
- Verify wallet address is valid Ethereum address
- Confirm Worldchain RPC endpoint is accessible
- Test CoinGecko API availability

## References

- [Worldchain Documentation](https://world.org)
- [Optimism RPC Docs](https://docs.optimism.io/)
- [ERC20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
