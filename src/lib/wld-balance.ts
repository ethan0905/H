/**
 * WLD Balance Fetching Utilities
 * Fetches $WLD token balance from Worldchain (Optimism-based L2)
 */

export interface WLDBalanceResult {
  success: boolean
  balance?: string // Balance in WLD tokens
  balanceUSD?: string // Balance in USD
  error?: string
}

// Worldchain RPC endpoint (Optimism-based L2)
const WORLDCHAIN_RPC = 'https://worldchain-mainnet.g.alchemy.com/public'

// WLD Token contract address on Worldchain
// This is a placeholder - replace with actual WLD token contract address
const WLD_TOKEN_ADDRESS = '0x2cFc85d8E48F8EAB294be644d9E25C3030863003' // Placeholder

// ERC20 balanceOf function signature
const BALANCE_OF_SIGNATURE = '0x70a08231'

/**
 * Fetch WLD token balance for a given wallet address
 * @param walletAddress The wallet address to check balance for
 * @returns Promise with balance result
 */
export async function fetchWLDBalance(walletAddress: string): Promise<WLDBalanceResult> {
  try {
    if (!walletAddress || walletAddress === 'Not connected') {
      return {
        success: false,
        error: 'Invalid wallet address',
      }
    }

    console.log('🔍 Fetching WLD balance for:', walletAddress)

    // Pad address to 32 bytes (remove 0x, pad left with zeros, add back 0x)
    const paddedAddress = '0x' + walletAddress.slice(2).padStart(64, '0')

    // Create the data payload for balanceOf(address)
    const data = BALANCE_OF_SIGNATURE + paddedAddress.slice(2)

    // Make RPC call to get token balance
    const response = await fetch(WORLDCHAIN_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          {
            to: WLD_TOKEN_ADDRESS,
            data: data,
          },
          'latest',
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error.message || 'RPC error')
    }

    // Parse the balance from hex
    const balanceHex = result.result
    const balanceWei = BigInt(balanceHex)
    
    // WLD has 18 decimals like ETH
    const balanceWLD = Number(balanceWei) / 1e18

    // Get WLD price in USD (you can replace this with a real price feed API)
    const wldPriceUSD = await fetchWLDPrice()
    const balanceUSD = balanceWLD * wldPriceUSD

    console.log('✅ WLD Balance:', {
      wld: balanceWLD.toFixed(4),
      usd: balanceUSD.toFixed(2),
    })

    return {
      success: true,
      balance: balanceWLD.toFixed(4),
      balanceUSD: balanceUSD.toFixed(2),
    }
  } catch (error) {
    console.error('❌ Error fetching WLD balance:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch balance',
    }
  }
}

/**
 * Fetch current WLD price in USD
 * Uses CoinGecko API (free tier, no API key required)
 */
async function fetchWLDPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=worldcoin-wld&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.warn('⚠️ Could not fetch WLD price, using fallback')
      return 2.5 // Fallback price
    }

    const data = await response.json()
    const price = data['worldcoin-wld']?.usd || 2.5

    console.log('💵 WLD Price: $' + price)
    return price
  } catch (error) {
    console.warn('⚠️ Error fetching WLD price, using fallback:', error)
    return 2.5 // Fallback price
  }
}

/**
 * Format wallet address for display (shortened version)
 * @param address Full wallet address
 * @returns Formatted address like "0x1234...5678"
 */
export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
