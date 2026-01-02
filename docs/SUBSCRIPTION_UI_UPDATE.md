# Earnings View - Subscription UI Update

## Changes Made

Updated the Earnings view to properly display subscription status and provide appropriate actions based on whether the user is subscribed or not.

### File Modified
- `/src/components/layout/MainApp.tsx` - EarningsView function

## Updates

### 1. Free Plan Card
**Before**: Always showed "Current Plan" button
**After**: Shows different button based on subscription status

```tsx
{subscriptionStatus === 'free' ? (
  <button>Current Plan</button>
) : (
  <div>Basic Plan</div>
)}
```

- When user is on **free plan**: Shows "Current Plan" button (highlighted)
- When user is on **pro plan**: Shows grayed out "Basic Plan" text

### 2. Pro Plan Card
**Before**: Showed "Active" button for pro users, "Upgrade Now" for free users
**After**: Shows "Cancel Subscription" for pro users, "Upgrade Now" for free users

```tsx
{subscriptionStatus === 'pro' ? (
  <button onClick={handleCancelSubscription}>
    Cancel Subscription
  </button>
) : (
  <button onClick={handleUpgradeToPro}>
    Upgrade Now
  </button>
)}
```

#### Cancel Subscription Button
- **Color**: Red border and text (`#ff4444`)
- **Hover**: Red background with 10% opacity
- **Confirmation**: Shows confirmation dialog before proceeding
- **Action**: Currently shows "coming soon" alert (TODO: implement cancellation API)

### 3. Plan Badge
The badge at the top of the Pro plan card updates dynamically:

- **Free users**: Shows "BEST VALUE" badge
- **Pro users**: Shows "CURRENT PLAN" badge

## User Experience

### For Free Users
1. See "Current Plan" on Free card (can't be changed)
2. See "BEST VALUE" badge on Pro card
3. See "Upgrade Now" button on Pro card
4. Can click to start upgrade process

### For Pro Users
1. See "Basic Plan" text on Free card (grayed out)
2. See "CURRENT PLAN" badge on Pro card
3. See "Cancel Subscription" button in red
4. Clicking cancel shows confirmation dialog
5. Must confirm before cancellation proceeds

## Visual Design

### Free Plan Card (for Pro users)
- Grayed out "Basic Plan" text instead of button
- Indicates this is not the active plan
- Clean, minimal appearance

### Pro Plan Card (for Pro users)
- Green "CURRENT PLAN" badge at top
- Red "Cancel Subscription" button
- Hover effect on cancel button
- All Pro features listed with checkmarks

### Cancel Button Styling
```tsx
border: 2px solid #ff4444
color: #ff4444
hover: bg-red-500/10
```

## Safety Features

### Confirmation Dialog
Before canceling, user sees:
```
Are you sure you want to cancel your subscription? 
You will lose access to Pro features at the end of your billing period.
```

Options:
- **OK**: Proceeds with cancellation
- **Cancel**: Aborts, no changes made

### Current Implementation
- Shows confirmation dialog ✅
- Alerts user that cancellation is coming soon ✅
- TODO: Implement actual API call to cancel subscription

## API Integration (To Do)

### Cancel Subscription Endpoint
Create `/api/subscriptions/cancel` endpoint:

```typescript
POST /api/subscriptions/cancel
Body: { userId: string, reason?: string }
Response: { success: boolean, message: string }
```

### Flow
1. User clicks "Cancel Subscription"
2. Confirmation dialog appears
3. User confirms
4. API call to cancel subscription
5. Update subscription status in database
6. Update UI to show free plan
7. Show success message
8. Pro badge removed from user
9. Pro features disabled

## Testing Checklist

### For Free Users
- [ ] Free plan shows "Current Plan" button
- [ ] Pro plan shows "BEST VALUE" badge
- [ ] Pro plan shows "Upgrade Now" button
- [ ] Can click Upgrade Now to start payment

### For Pro Users
- [ ] Free plan shows "Basic Plan" text (no button)
- [ ] Pro plan shows "CURRENT PLAN" badge
- [ ] Pro plan shows "Cancel Subscription" button in red
- [ ] Cancel button hovers with red background
- [ ] Clicking cancel shows confirmation dialog
- [ ] Confirming shows "coming soon" message

## Status
✅ **UI Complete** - Ready for subscription cancellation API implementation

## Next Steps
1. Create `/api/subscriptions/cancel` endpoint
2. Implement cancellation logic
3. Handle prorated refunds (if applicable)
4. Update user's subscription status in database
5. Remove Pro badge and features
6. Send confirmation email
7. Update the cancel button handler to call the API
