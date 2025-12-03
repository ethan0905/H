#!/bin/bash
# Run communities seed script on production database
# Usage: ./seed-prod-communities.sh

echo "🌱 Seeding communities to PRODUCTION database..."
echo ""
echo "⚠️  This will seed communities into your production database."
echo "   Press Ctrl+C to cancel, or Enter to continue..."
read

# Run the seed script with production database URL
npx tsx scripts/seed-communities.ts

echo ""
echo "✅ Production communities seeded!"
echo ""
echo "🔍 Verifying communities in production..."
npx tsx scripts/check-communities.ts
