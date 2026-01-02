#!/bin/bash

echo "🔍 H World - Environment Check"
echo "================================"
echo ""

# Check Node version
echo "📦 Node version:"
node --version
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file found"
else
    echo "❌ .env.local file NOT found"
    exit 1
fi
echo ""

# Check environment variables (without showing sensitive data)
echo "🔐 Checking environment variables:"
if grep -q "NEXT_PUBLIC_MINIKIT_APP_ID=app_" .env.local; then
    echo "✅ NEXT_PUBLIC_MINIKIT_APP_ID is set and starts with 'app_'"
else
    echo "❌ NEXT_PUBLIC_MINIKIT_APP_ID is missing or has wrong format"
    echo "   It should start with 'app_' or 'app_staging_'"
fi

if grep -q "NEXT_PUBLIC_WORLD_APP_ID=app_" .env.local; then
    echo "✅ NEXT_PUBLIC_WORLD_APP_ID is set and starts with 'app_'"
else
    echo "❌ NEXT_PUBLIC_WORLD_APP_ID is missing or has wrong format"
fi

if grep -q "NEXT_PUBLIC_WORLD_ID_ACTION" .env.local; then
    echo "✅ NEXT_PUBLIC_WORLD_ID_ACTION is set"
else
    echo "❌ NEXT_PUBLIC_WORLD_ID_ACTION is missing"
fi

if grep -q "DATABASE_URL" .env.local; then
    echo "✅ DATABASE_URL is set"
else
    echo "❌ DATABASE_URL is missing"
fi
echo ""

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ node_modules exists"
else
    echo "⚠️  node_modules not found - run 'npm install'"
fi
echo ""

# Check Prisma
echo "🗄️  Checking Prisma setup:"
if [ -d node_modules/.prisma ]; then
    echo "✅ Prisma client generated"
else
    echo "⚠️  Prisma client not generated - run 'npx prisma generate'"
fi
echo ""

# Check build
echo "🏗️  Build check:"
if [ -d .next ]; then
    echo "✅ .next build directory exists"
    echo "   (Run 'rm -rf .next && npm run build' to rebuild)"
else
    echo "⚠️  No build found - run 'npm run build'"
fi
echo ""

echo "================================"
echo "✨ Next steps:"
echo "1. npm install"
echo "2. npx prisma generate"
echo "3. npx prisma db push"
echo "4. npm run build"
echo "5. npm start"
echo ""
echo "For World App testing:"
echo "1. Deploy to Vercel/Netlify"
echo "2. Set environment variables in hosting platform"
echo "3. Use Developer Portal to generate QR code"
echo "4. Enable remote debugging to see console logs"
echo ""
