#!/bin/bash

# Quick Vercel Deployment Script
# This script commits and pushes all changes to GitHub for Vercel deployment

set -e  # Exit on error

echo "🚀 H World - Quick Vercel Deployment"
echo "===================================="
echo ""

# Check git status
echo "📋 Checking git status..."
git status --short
echo ""

# Confirm before proceeding
read -p "Do you want to commit and push these changes? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Stage all changes
echo ""
echo "📦 Staging all changes..."
git add .

# Commit
echo ""
read -p "Enter commit message (default: 'feat: prepare for Vercel deployment'): " commit_message
commit_message=${commit_message:-"feat: prepare for Vercel deployment"}

echo "💾 Committing changes..."
git commit -m "$commit_message"

# Push to main
echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Add environment variables (see VERCEL_DEPLOY_CHECKLIST.md)"
echo "4. Deploy!"
echo ""
echo "📚 Full guide: See VERCEL_DEPLOY_CHECKLIST.md and DEPLOYMENT.md"
