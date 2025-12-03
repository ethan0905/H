#!/bin/bash

# List of files that need dynamic export
files=(
  "src/app/api/tweets/route.ts"
  "src/app/api/tweets/[tweetId]/route.ts"
  "src/app/api/tweets/[tweetId]/comments/route.ts"
  "src/app/api/tweets/interactions/route.ts"
  "src/app/api/users/[userId]/tweets/route.ts"
  "src/app/api/users/[userId]/comments/route.ts"
  "src/app/api/users/follow/route.ts"
  "src/app/api/users/profile/route.ts"
  "src/app/api/communities/route.ts"
  "src/app/api/communities/join/route.ts"
  "src/app/api/communities/leave/route.ts"
  "src/app/api/communities/[communityId]/posts/route.ts"
  "src/app/api/communities/[communityId]/posts/[postId]/comments/route.ts"
  "src/app/api/community/banner/route.ts"
  "src/app/api/world-id/session/route.ts"
  "src/app/api/payments/initiate/route.ts"
  "src/app/api/payments/verify/route.ts"
  "src/app/api/subscriptions/confirm/route.ts"
  "src/app/api/subscriptions/upgrade/route.ts"
  "src/app/api/gamification/leaderboards/route.ts"
  "src/app/api/gamification/user/[userId]/route.ts"
  "src/app/api/upload-image/route.ts"
  "src/app/api/verify-world-id/route.ts"
  "src/app/api/nonce/route.ts"
  "src/app/api/debug/route.ts"
  "src/app/api/debug-world-config/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    if ! grep -q "export const dynamic" "$file"; then
      echo "Processing: $file"
      # Add exports after the import statements
      perl -i -pe 'print "\nexport const runtime = '\''nodejs'\'';\nexport const dynamic = '\''force-dynamic'\'';\n" if /^import/ && !$printed++' "$file"
    else
      echo "Skipping (already has dynamic): $file"
    fi
  else
    echo "File not found: $file"
  fi
done

echo "Done!"
