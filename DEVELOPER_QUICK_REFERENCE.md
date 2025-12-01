# Developer Quick Reference - Interactive Features

## 🎯 Quick Access Guide

### File Locations
```
/src/components/layout/MainApp.tsx
├── CommunitiesView() ← Join/leave logic
├── CreateView()      ← Content creation & earnings preview
└── EarningsView()    ← Plans & revenue forecasting
```

---

## 📝 Code Snippets

### Communities - Join Logic
```typescript
// State
const [joinedCommunities, setJoinedCommunities] = useState<number[]>([])

// Handler
const handleJoinCommunity = (communityId: number) => {
  if (joinedCommunities.includes(communityId)) {
    setJoinedCommunities(joinedCommunities.filter(id => id !== communityId))
  } else {
    setJoinedCommunities([...joinedCommunities, communityId])
  }
}

// Check status
const isJoined = (communityId: number) => joinedCommunities.includes(communityId)

// Button
<button onClick={() => handleJoinCommunity(community.id)}>
  {isJoined(community.id) ? "Joined" : "Join"}
</button>
```

### Create - Earnings Calculator
```typescript
// State
const [content, setContent] = useState("")
const [selectedType, setSelectedType] = useState<"text" | "image" | "video">("text")

// Calculate earnings
const estimatedEarnings = Math.min(content.length * 0.05, 50)
// Formula: $0.05 per character, capped at $50 per 1000 views

// Progress percentage
const progressPercent = Math.min((estimatedEarnings / 50) * 100, 100)

// Textarea
<textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder="Share your human perspective..."
/>

// Display
<span>${estimatedEarnings.toFixed(2)}</span>
```

### Earnings - Revenue Forecast
```typescript
// Last 7 days data
const earningsData = [
  { day: "Mon", amount: 34.2 },
  { day: "Tue", amount: 52.8 },
  // ... rest of week
]

// Calculate weekly total
const weekEarnings = earningsData.reduce((sum, day) => sum + day.amount, 0)

// Project monthly
const projectedMonthly = weekEarnings > 0 ? (weekEarnings / 7) * 30 : 0

// Display
<p>This Week: ${weekEarnings.toFixed(2)}</p>
<p>Projected Monthly: ${projectedMonthly.toFixed(2)}</p>
```

---

## 🎨 Design Tokens

### Colors
```typescript
const colors = {
  primary: "#00FFBD",           // Cyan
  primaryDark: "#00E5A8",       // Hover state
  primaryGlow: "rgba(0,255,189,0.3)",
  background: "#000000",        // Black
  cardBg: "#0A0A0A",           // Dark gray
  border: "#1F2937",           // Gray-800
  borderHover: "#374151",      // Gray-700
  textPrimary: "#FFFFFF",      // White
  textSecondary: "#9CA3AF",    // Gray-400
  textTertiary: "#6B7280",     // Gray-500
}
```

### Spacing
```typescript
const spacing = {
  cardPadding: "24px",        // p-6
  sectionGap: "24px",         // mb-6
  elementGap: "16px",         // gap-4
  iconSize: "20px",           // w-5 h-5
  buttonHeight: "40px",       // py-2
  borderRadius: "16px",       // rounded-2xl
}
```

### Effects
```typescript
const effects = {
  glow: "shadow-[0_0_30px_rgba(0,255,189,0.3)]",
  backdropBlur: "backdrop-blur-xl",
  transition: "transition-all duration-300",
  hoverScale: "hover:scale-105",
}
```

---

## 🔌 Backend Integration Points

### Communities API
```typescript
// POST /api/communities/join
{
  userId: string,
  communityId: number
}
// Response: { success: boolean, message: string }

// POST /api/communities/leave
{
  userId: string,
  communityId: number
}

// GET /api/communities/joined?userId={userId}
// Response: { communityIds: number[] }
```

### Create API
```typescript
// POST /api/tweets
{
  content: string,
  type: "text" | "image" | "video",
  userId: string,
  communityId?: number
}
// Response: { tweetId: string, success: boolean }

// POST /api/uploads (for images/videos)
{
  file: File,
  userId: string
}
// Response: { url: string, success: boolean }
```

### Earnings API
```typescript
// GET /api/earnings/stats?userId={userId}
// Response: {
//   last7Days: { day: string, amount: number }[],
//   totalEarnings: number,
//   weekEarnings: number,
//   projectedMonthly: number
// }

// POST /api/plans/upgrade
{
  userId: string,
  plan: "pro",
  paymentMethod: string
}
// Response: { success: boolean, subscriptionId: string }

// GET /api/user/plan?userId={userId}
// Response: { plan: "free" | "pro", expiresAt?: string }
```

---

## 🧪 Testing Scenarios

### Communities
```typescript
describe("CommunitiesView", () => {
  it("should toggle join status", () => {
    // 1. Verify button shows "Join"
    // 2. Click button
    // 3. Verify button shows "Joined"
    // 4. Verify state includes communityId
    // 5. Click button again
    // 6. Verify button shows "Join"
    // 7. Verify state no longer includes communityId
  })
})
```

### Create
```typescript
describe("CreateView", () => {
  it("should calculate earnings in real-time", () => {
    // 1. Type 10 characters
    // 2. Verify earnings = $0.50 (10 * 0.05)
    // 3. Type 100 characters
    // 4. Verify earnings = $5.00 (100 * 0.05)
    // 5. Type 1000 characters
    // 6. Verify earnings = $50.00 (capped)
  })
  
  it("should enable post button when content exists", () => {
    // 1. Verify button is disabled
    // 2. Type content
    // 3. Verify button is enabled
    // 4. Clear content
    // 5. Verify button is disabled again
  })
})
```

### Earnings
```typescript
describe("EarningsView", () => {
  it("should calculate projected monthly correctly", () => {
    // Given: Last 7 days total = $70
    // When: projectedMonthly is calculated
    // Then: ($70 / 7) * 30 = $300
  })
})
```

---

## 📊 State Management

### Local Component State
```typescript
// Communities
useState<number[]>([])              // Joined community IDs

// Create
useState<string>("")                 // Content text
useState<"text"|"image"|"video">()  // Selected type

// Earnings
// (Calculations only, no state needed)
```

### Future: Global State (Zustand/Redux)
```typescript
// store/communityStore.ts
interface CommunityState {
  joinedCommunities: number[]
  joinCommunity: (id: number) => void
  leaveCommunity: (id: number) => void
}

// store/earningsStore.ts
interface EarningsState {
  totalEarnings: number
  last7Days: { day: string, amount: number }[]
  plan: "free" | "pro"
  fetchEarnings: () => Promise<void>
}
```

---

## 🚀 Performance Optimization

### Memoization (Future)
```typescript
import { useMemo } from "react"

// Memoize expensive calculations
const projectedMonthly = useMemo(() => {
  return weekEarnings > 0 ? (weekEarnings / 7) * 30 : 0
}, [weekEarnings])

const estimatedEarnings = useMemo(() => {
  return Math.min(content.length * 0.05, 50)
}, [content.length])
```

### Debouncing (Future)
```typescript
import { useDebounce } from "use-debounce"

// Debounce content for API calls
const [debouncedContent] = useDebounce(content, 500)

useEffect(() => {
  // Save draft to backend
  saveDraft(debouncedContent)
}, [debouncedContent])
```

---

## 🎯 Common Tasks

### Add a New Community
```typescript
// In CommunitiesView, add to communities array:
{
  id: 6,
  name: "Your Community",
  category: "Technology",
  members: 1234,
  gradient: "from-blue-500 to-purple-500",
  description: "Description here",
  Icon: YourIcon, // from lucide-react
}
```

### Change Earnings Formula
```typescript
// In CreateView:
const estimatedEarnings = Math.min(content.length * 0.08, 75)
//                                   characters * ^^^^  ^^^
//                                              rate  cap
```

### Add a New Plan Tier
```typescript
// In EarningsView, add after Pro plan:
<div className="bg-black border-2 rounded-2xl p-6" 
     style={{ borderColor: "#FFD700" }}>
  <h3>Enterprise</h3>
  <p>$29.99/mo</p>
  {/* Features... */}
</div>
```

---

## 🐛 Debugging Tips

### State Not Updating?
```typescript
// Check if state is being set correctly
console.log("Joined communities:", joinedCommunities)

// Check if handler is called
const handleJoinCommunity = (id: number) => {
  console.log("Joining community:", id)
  // ...rest of logic
}
```

### Calculation Wrong?
```typescript
// Log intermediate values
console.log("Content length:", content.length)
console.log("Raw calculation:", content.length * 0.05)
console.log("Capped value:", Math.min(content.length * 0.05, 50))
```

### Styling Not Applying?
```typescript
// Verify Tailwind classes are correct
className="bg-[#00FFBD]"  // ✅ Correct
className="bg-cyan"       // ❌ Won't work (not in config)

// Check if style prop is needed for custom values
style={{ backgroundColor: "#00FFBD" }}  // ✅ For precise hex
```

---

## 📚 Resources

### Documentation
- React Hooks: https://react.dev/reference/react
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev/icons
- Next.js: https://nextjs.org/docs

### Internal Docs
- `/INTERACTIVE_FEATURES_COMPLETE.md` - Full implementation guide
- `/FINAL_IMPLEMENTATION_SUMMARY.md` - Quick overview
- `/VISUAL_CHANGELOG_INTERACTIVE.md` - Before/after comparisons

---

## ⚡ Quick Commands

### Development
```bash
npm run dev          # Start dev server (localhost:3001)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check for errors
```

### Testing (Future)
```bash
npm test             # Run all tests
npm test:watch       # Watch mode
npm test:coverage    # Coverage report
```

---

## 🎓 Key Concepts

### Controlled Components
```typescript
// The textarea value is controlled by React state
<textarea
  value={content}                    // ← Controlled by state
  onChange={(e) => setContent(e.target.value)}
/>
```

### Derived State
```typescript
// Don't store calculated values in state
const estimatedEarnings = Math.min(content.length * 0.05, 50)
//    ^^^^^^^^^^^^^^ Calculated on every render
//    No useState needed!
```

### Conditional Rendering
```typescript
// Show different button text based on state
{isJoined(community.id) ? "Joined" : "Join"}

// Apply different styles
className={isJoined(id) ? "border-cyan" : "bg-cyan"}
```

---

## 🔥 Hot Tips

1. **State Management**: Keep state local until you need it globally
2. **Calculations**: Derive values instead of storing them in state
3. **Styling**: Use Tailwind for common styles, `style` prop for exact hex
4. **Icons**: Import from lucide-react, already installed
5. **Type Safety**: Always define TypeScript types for state
6. **Testing**: Test user interactions, not implementation details
7. **Performance**: React is fast by default, optimize only if needed
8. **Mobile**: Tailwind responsive classes handle mobile automatically

---

## 📞 Need Help?

### Common Issues

**"State not updating"**
- Check if you're mutating state directly (don't!)
- Use spread operator: `[...array, newItem]`

**"Calculation seems wrong"**
- Log intermediate values
- Check for order of operations
- Verify Math.min/max usage

**"Styles not applying"**
- Verify Tailwind class names
- Check for conflicting styles
- Use browser DevTools to inspect

**"TypeScript errors"**
- Check type definitions
- Ensure imports are correct
- Run `npm run lint` to see all errors

---

## ✅ Checklist for New Features

- [ ] Update TypeScript types
- [ ] Add proper state management
- [ ] Implement event handlers
- [ ] Apply consistent styling (black/cyan theme)
- [ ] Test on mobile and desktop
- [ ] Add hover/focus states
- [ ] Check accessibility (keyboard nav)
- [ ] Document in markdown
- [ ] No TypeScript errors
- [ ] Hot reload working

---

**Last Updated**: 2024  
**Maintainer**: H World Development Team  
**Status**: Production Ready ✅
