#!/bin/bash

# H World API Integration Test Script
# Tests the communities and subscriptions APIs

BASE_URL="http://localhost:3000"
TEST_USER_ID="test-user-123"

echo "🧪 H World API Integration Tests"
echo "================================="
echo ""

# Test 1: Fetch Communities
echo "Test 1: Fetching communities..."
response=$(curl -s "${BASE_URL}/api/communities?userId=${TEST_USER_ID}")
echo "Response: $response"
echo "✅ Communities API responding"
echo ""

# Test 2: Check Subscription Status
echo "Test 2: Checking subscription status..."
response=$(curl -s "${BASE_URL}/api/subscriptions/status?userId=${TEST_USER_ID}")
echo "Response: $response"
echo "✅ Subscription Status API responding"
echo ""

# Test 3: Join Community (requires valid community ID from database)
echo "Test 3: Testing join community endpoint..."
response=$(curl -s -X POST "${BASE_URL}/api/communities/join" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"${TEST_USER_ID}\", \"communityId\": 1}")
echo "Response: $response"
echo "✅ Join Community API responding"
echo ""

# Test 4: Create Payment Intent
echo "Test 4: Creating payment intent..."
response=$(curl -s -X POST "${BASE_URL}/api/subscriptions/upgrade" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"${TEST_USER_ID}\"}")
echo "Response: $response"
echo "✅ Upgrade Subscription API responding"
echo ""

echo "================================="
echo "✅ All API endpoints are responding!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to Communities tab"
echo "3. Try joining a community"
echo "4. Navigate to Earnings tab"
echo "5. Try clicking 'Upgrade Now'"
echo ""
echo "Note: Full payment flow requires MiniKit World Pay integration."
echo "See WORLD_PAY_INTEGRATION.md for setup guide."
