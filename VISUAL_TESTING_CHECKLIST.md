# Visual Testing Checklist - December 2, 2024

## Overview
This document provides step-by-step instructions to visually test the completed features.

---

## Test 1: Community Comments Inline UX

### Setup
1. Start the dev server: `npm run dev`
2. Open the app in World App or browser
3. Log in with a verified account

### Test Steps

#### A. View Community Comments
1. Navigate to the **Communities** tab
2. Select any community (e.g., "AI Agents")
3. Find a post with existing comments
4. Click the **comment icon** (speech bubble) on the post
5. **Expected Result:**
   - Comments appear **inline** below the post (NOT in a modal)
   - Comments display in a scrollable list (max-h-96)
   - Each comment shows:
     - Avatar with first letter initial in #00FFBE circle
     - Username in white
     - Timestamp in gray
     - Comment text in gray-200
     - Background: white/5 with rounded corners

#### B. Add a Comment
1. With comments expanded, find the comment input at the bottom
2. Type a test comment (e.g., "Testing inline comments!")
3. Click the **Send** button (paper plane icon)
4. **Expected Result:**
   - Your comment appears immediately in the list
   - Comment count updates
   - Input field clears
   - No page refresh or navigation

#### C. Toggle Comments
1. Click the comment icon again to close comments
2. **Expected Result:**
   - Comments section collapses smoothly
   - Comment icon changes from highlighted (#00FFBD) to gray
3. Click comment icon again to re-open
4. **Expected Result:**
   - Comments expand again
   - Previous comments are still visible

#### D. Verify Styling Consistency
1. Navigate back to **Home** feed
2. Find a post with comments
3. Expand comments on a home feed post
4. Compare with community comments
5. **Expected Result:**
   - Both should look identical
   - Same avatar style (initials in #00FFBE circle)
   - Same background colors (white/5)
   - Same spacing and borders
   - Same input form styling

---

## Test 2: Earnings View Plan Descriptions

### Setup
1. Navigate to the **Earnings** tab
2. Scroll down to "Creator Plans" section

### Test Steps

#### A. Free Plan Verification
1. Locate the "Free" plan card
2. **Verify these features are listed:**
   - ✅ Unlimited posts per day
   - ✅ 5 first posts monetized
   - ✅ 120 characters per post
   - ✅ 20% withdrawal fees
3. **Verify button state:**
   - If you're on free plan: Button should say **"Current Plan"**
   - If you're on pro plan: Should show **"Basic Plan"** text in gray

#### B. Pro Creator Plan Verification
1. Locate the "Pro Creator" plan card
2. **Verify the card has:**
   - Border with #00FFBD color
   - Shadow effect: `shadow-[0_0_30px_rgba(0,255,189,0.3)]`
   - Badge at top saying "BEST VALUE" (free users) or "CURRENT PLAN" (pro users)
3. **Verify these features are listed:**
   - ✅ 10x more revenue per post
   - ✅ Unlimited content publishing
   - ✅ Unlimited monetization
   - ✅ Season 1 OG Human Badge (unique, permanent)
   - ✅ 5% withdrawal fees
   - ✅ Priority support and analytics
   - ✅ Early access to new features
4. **Verify button state:**
   - If you're on free plan: Button should say **"Upgrade Now"** (black text on #00FFBD background)
   - If you're on pro plan: Button should say **"Cancel Subscription"** (red text #ff4444)

#### C. Button Interaction
1. **For Free Users:**
   - Click "Upgrade Now" button
   - Should initiate MiniKit payment flow
   - Payment modal should appear
2. **For Pro Users:**
   - Click "Cancel Subscription" button
   - Confirmation dialog should appear
   - Click OK
   - Should show: "Subscription cancellation will be implemented soon. Please contact support for now."

---

## Test 3: Cross-Feature Integration

### Verify Avatar Display
1. Check that all avatars show **first letter initials** in #00FFBE circles
2. Verify this in:
   - Community posts
   - Community comments
   - Home feed posts
   - Home feed comments
   - Profile pages

### Verify Season 1 OG Badge
1. If you have a Pro subscription:
   - Navigate to your profile
   - Verify "Season 1 OG" badge appears
   - Check that it shows in:
     - Your profile header
     - Your posts in feed
     - Your comments
     - Your community posts

### Verify Subscription Status Sync
1. Upgrade to Pro (if not already)
2. Navigate to different views:
   - Check Earnings view shows "Cancel Subscription"
   - Check Profile shows Season 1 OG badge
   - Check posts show Season 1 OG badge
3. All should be consistent

---

## Common Issues & Solutions

### Issue: Comments not appearing inline
- **Solution:** Clear browser cache and reload
- **Check:** Ensure you're looking at community posts, not regular tweets

### Issue: Plan features don't match
- **Solution:** Hard refresh the page (Cmd/Ctrl + Shift + R)
- **Check:** Verify you're on the latest version (git pull)

### Issue: Avatars still showing images
- **Solution:** Check that AvatarInitial component was updated
- **File:** `/src/components/ui/AvatarInitial.tsx`
- **Expected:** Should always render first letter, ignoring imageUrl

### Issue: Badge not showing for Pro users
- **Solution:** Ensure database has `isSeasonOneOG: true`
- **Check:** Run query: `SELECT isSeasonOneOG FROM User WHERE id = 'YOUR_USER_ID';`

---

## Screenshots Checklist

Take screenshots of:
1. [ ] Community post with inline comments expanded
2. [ ] Community comment input form
3. [ ] Home feed with inline comments (for comparison)
4. [ ] Free plan card in Earnings view
5. [ ] Pro Creator plan card in Earnings view
6. [ ] Pro Creator plan with "Cancel Subscription" button
7. [ ] Season 1 OG badge in profile
8. [ ] Avatar initials in various contexts

---

## Sign-off

Once all tests pass:
- [ ] Community comments display inline ✅
- [ ] Community comments match home feed styling ✅
- [ ] Free plan shows 4 correct features ✅
- [ ] Pro plan shows 7 correct features ✅
- [ ] Button text changes based on subscription status ✅
- [ ] All avatars show initials in #00FFBE circles ✅

**Testing Completed By:** _____________  
**Date:** _____________  
**Notes:** _____________
