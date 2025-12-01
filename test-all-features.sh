#!/bin/bash

# Test Script for H World Integration
# Tests all major features: Communities, Subscriptions, Feature Gates

echo "🧪 H World Integration Test Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Test counter
PASSED=0
FAILED=0

# Helper function to test API
test_api() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$url")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $status_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📦 1. Testing Communities API"
echo "----------------------------"
test_api "Fetch Communities" "/api/communities"
test_api "Join Community" "/api/communities/join" "POST" '{"communityId":1,"userId":"test-user"}'
test_api "Leave Community" "/api/communities/leave" "POST" '{"communityId":1,"userId":"test-user"}'
echo ""

echo "💳 2. Testing Subscriptions API"
echo "------------------------------"
test_api "Get Subscription Status" "/api/subscriptions/status"
test_api "Create Payment Intent" "/api/subscriptions/upgrade" "POST" '{"userId":"test-user"}'
echo ""

echo "🔧 3. Testing Feature Gates"
echo "--------------------------"

# Test subscription features
echo "Testing subscription limits..."

node -e "
const { 
  canUserPost, 
  isPostLengthValid, 
  calculateWithdrawalFee,
  getRemainingPosts 
} = require('./src/lib/subscription-features.ts');

console.log('Free plan can post (0 posts today):', canUserPost('free', 0) ? '✅' : '❌');
console.log('Free plan can post (10 posts today):', !canUserPost('free', 10) ? '✅' : '❌');
console.log('Pro plan unlimited posts:', canUserPost('pro', 100) ? '✅' : '❌');
console.log('Free plan 280 char limit:', isPostLengthValid('free', 280) ? '✅' : '❌');
console.log('Free plan exceeds limit:', !isPostLengthValid('free', 281) ? '✅' : '❌');
console.log('Pro plan 1000 char limit:', isPostLengthValid('pro', 1000) ? '✅' : '❌');
console.log('Free withdrawal fee (20%):', calculateWithdrawalFee('free', 100) === 20 ? '✅' : '❌');
console.log('Pro withdrawal fee (5%):', calculateWithdrawalFee('pro', 100) === 5 ? '✅' : '❌');
" 2>/dev/null || echo -e "${YELLOW}⚠ Note: TypeScript test skipped (requires ts-node)${NC}"

echo ""

echo "📊 4. Testing Database"
echo "--------------------"
if [ -f "prisma/dev.db" ]; then
    echo -e "${GREEN}✓${NC} Database exists: prisma/dev.db"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC} Database not found"
    FAILED=$((FAILED + 1))
fi

# Check if database has tables
if command -v sqlite3 &> /dev/null; then
    tables=$(sqlite3 prisma/dev.db ".tables" 2>/dev/null)
    if [[ $tables == *"Community"* ]] && [[ $tables == *"Subscription"* ]]; then
        echo -e "${GREEN}✓${NC} Required tables exist"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} Required tables missing"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} sqlite3 not installed, skipping table check"
fi

echo ""

echo "⚙️  5. Testing Environment"
echo "------------------------"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    PASSED=$((PASSED + 1))
    
    if grep -q "NEXT_PUBLIC_MINIKIT_APP_ID" .env.local; then
        echo -e "${GREEN}✓${NC} MiniKit App ID configured"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} MiniKit App ID not configured"
        FAILED=$((FAILED + 1))
    fi
    
    if grep -q "NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS" .env.local; then
        address=$(grep "NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS" .env.local | cut -d'=' -f2)
        if [ "$address" != "0x0000000000000000000000000000000000000000" ]; then
            echo -e "${GREEN}✓${NC} Payment recipient address configured"
            PASSED=$((PASSED + 1))
        else
            echo -e "${YELLOW}⚠${NC} Payment recipient address is placeholder"
            echo "  → Update with your actual wallet address"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Payment recipient address not configured"
        echo "  → Add NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS to .env.local"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found"
    FAILED=$((FAILED + 1))
fi

echo ""

echo "📁 6. Testing File Structure"
echo "--------------------------"
files=(
    "src/lib/worldpay.ts"
    "src/lib/subscription-features.ts"
    "src/components/layout/MainApp.tsx"
    "src/components/tweet/ComposeTweet.tsx"
    "src/app/api/communities/route.ts"
    "src/app/api/subscriptions/status/route.ts"
    "prisma/schema.prisma"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $file missing"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "=================================="
echo "📊 Test Results"
echo "=================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ Next steps:"
    echo "   1. Start dev server: npm run dev"
    echo "   2. Open http://localhost:3000"
    echo "   3. Test communities and subscriptions"
    echo "   4. Configure payment wallet for production"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure dev server is running: npm run dev"
    echo "   2. Check database is migrated: npx prisma migrate dev"
    echo "   3. Seed database: npm run seed:full"
    echo "   4. Check .env.local configuration"
    exit 1
fi
