# Subscription UI - Visual Guide

## User Views

### Free User View
```
┌─────────────────────────────────────┐
│ Free Plan                           │
│ $0/mo                              │
│ [Current Plan]  ← Highlighted      │
│                                     │
│ ✓ 10 posts per day                 │
│ ✓ 280 characters                   │
│ ✓ 20% withdrawal fees              │
│ ✓ Basic analytics                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚡ BEST VALUE ⚡                    │
│ Pro Creator                         │
│ $7.40/mo                           │
│ [Upgrade Now]  ← Green button      │
│                                     │
│ ✓ Unlimited content                │
│ ✓ 1000 characters                  │
│ ✓ 5% withdrawal fees               │
│ ✓ Season 1 Human Badge             │
│ ✓ Priority support                 │
│ ✓ Early access                     │
└─────────────────────────────────────┘
```

### Pro User View
```
┌─────────────────────────────────────┐
│ Free Plan                           │
│ $0/mo                              │
│ Basic Plan  ← Grayed out text      │
│                                     │
│ ✓ 10 posts per day                 │
│ ✓ 280 characters                   │
│ ✓ 20% withdrawal fees              │
│ ✓ Basic analytics                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 👑 CURRENT PLAN 👑                 │
│ Pro Creator                         │
│ $7.40/mo                           │
│ [Cancel Subscription]  ← Red       │
│                                     │
│ ✓ Unlimited content                │
│ ✓ 1000 characters                  │
│ ✓ 5% withdrawal fees               │
│ ✓ Season 1 Human Badge             │
│ ✓ Priority support                 │
│ ✓ Early access                     │
└─────────────────────────────────────┘
```

## Button States

### Current Plan Button (Free users on Free plan)
```
┌──────────────────┐
│  Current Plan    │  ← Gray border, no hover
└──────────────────┘
```

### Basic Plan Text (Pro users viewing Free plan)
```
   Basic Plan        ← Plain text, gray color, no button
```

### Upgrade Now Button (Free users viewing Pro plan)
```
┌──────────────────┐
│  Upgrade Now     │  ← Cyan background (#00FFBD)
└──────────────────┘     Black text, hover effect
```

### Cancel Subscription Button (Pro users on Pro plan)
```
┌──────────────────┐
│ Cancel Subscription│  ← Red border (#ff4444)
└──────────────────┘     Red text, red hover background
```

## Interaction Flow

### Free User Clicking Upgrade
```
1. Click "Upgrade Now" button
   ↓
2. Payment flow starts (MiniKit)
   ↓
3. Payment verified
   ↓
4. UI updates to Pro view
   ↓
5. Shows "Cancel Subscription" button
```

### Pro User Clicking Cancel
```
1. Click "Cancel Subscription" button
   ↓
2. Confirmation dialog appears:
   "Are you sure you want to cancel?"
   ↓
3a. User clicks Cancel → Nothing happens
3b. User clicks OK → Cancellation proceeds
   ↓
4. Currently shows "coming soon" alert
5. (Future) API call to cancel
6. (Future) UI updates to Free view
```

## Color Codes

### Green/Cyan (Brand Color)
- **Hex**: `#00FFBD`
- **Usage**: Upgrade button, active states, highlights
- **Effect**: Welcoming, positive action

### Red (Warning/Cancel)
- **Hex**: `#ff4444`
- **Usage**: Cancel subscription button
- **Effect**: Caution, destructive action

### Gray (Inactive)
- **Usage**: Inactive plan indicator, disabled states
- **Effect**: Neutral, not-selected

## Badge Styling

### "BEST VALUE" Badge
```css
position: absolute
top: -12px
background: black
border: 2px solid #00FFBD
color: #00FFBD
padding: 4px 12px
border-radius: 9999px
font-weight: bold
font-size: 12px
```

### "CURRENT PLAN" Badge
```css
position: absolute
top: -12px
background: black
border: 2px solid #00FFBD
color: #00FFBD
padding: 4px 12px
border-radius: 9999px
font-weight: bold
font-size: 12px
```

## Confirmation Dialog

### Text
```
Are you sure you want to cancel your subscription?
You will lose access to Pro features at the end 
of your billing period.
```

### Buttons
- **OK**: Proceeds with cancellation
- **Cancel**: Aborts action

## Responsive Design

### Desktop
- Plans displayed in grid
- Full button text visible
- Side-by-side comparison

### Mobile
- Plans stack vertically
- Buttons full width
- Touch-friendly spacing

## Accessibility

- ✅ High contrast buttons
- ✅ Clear confirmation dialog
- ✅ Descriptive button text
- ✅ Visible focus states
- ✅ Touch targets minimum 44x44px

## Status Indicators

### subscriptionStatus = 'free'
- Free plan: "Current Plan" button
- Pro plan: "Upgrade Now" button
- Badge: "BEST VALUE"

### subscriptionStatus = 'pro'
- Free plan: "Basic Plan" text
- Pro plan: "Cancel Subscription" button
- Badge: "CURRENT PLAN"

## Testing URLs

### Test as Free User
1. Sign in as user without subscription
2. Navigate to Earnings tab
3. Verify Free plan shows "Current Plan"
4. Verify Pro plan shows "Upgrade Now"

### Test as Pro User
1. Sign in as user with active subscription (e.g., user_0x3ffd33)
2. Navigate to Earnings tab
3. Verify Free plan shows "Basic Plan" (no button)
4. Verify Pro plan shows "Cancel Subscription"
5. Click cancel and verify confirmation dialog

## Implementation Status

✅ Free plan dynamic button
✅ Pro plan conditional button
✅ Cancel subscription button styling
✅ Confirmation dialog
✅ Badge updates based on status
⏳ Cancel subscription API (TODO)
⏳ Actual cancellation flow (TODO)
