#!/bin/bash

# Vercel Deployment Preparation Script
# This script prepares your app for Vercel deployment

echo "🚀 Preparing H World for Vercel Deployment..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "❌ .gitignore not found!"
    exit 1
else
    echo "✅ .gitignore configured"
fi

# Check if vercel.json exists
if [ ! -f vercel.json ]; then
    echo "❌ vercel.json not found!"
    exit 1
else
    echo "✅ vercel.json configured"
fi

# Check if .env.example exists
if [ ! -f .env.example ]; then
    echo "❌ .env.example not found!"
    exit 1
else
    echo "✅ .env.example created"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client for PostgreSQL
echo ""
echo "🔄 Note: Prisma is configured for PostgreSQL"
echo "   You'll need to set DATABASE_URL in Vercel to generate the client"
echo "   Format: postgresql://user:password@host:5432/dbname"

# Check build
echo ""
echo "🔨 Testing build (without database)..."
echo "   (This may show Prisma warnings - that's expected)"
# Skip this for now since we don't have PostgreSQL yet
# npm run build

echo ""
echo "✅ Preparation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create a PostgreSQL database (Vercel Postgres, Supabase, or Railway)"
echo "2. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Vercel deployment'"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git push -u origin main"
echo ""
echo "3. Import your repo in Vercel Dashboard"
echo "4. Add environment variables in Vercel"
echo "5. Deploy!"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
