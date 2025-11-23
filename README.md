# H World - A human-verified social network designed to safeguard humans in the Intelligence Age.

A modern, decentralized social media platform built for World App using minikit-js. This application features World ID verification, wallet authentication, and real-time social interactions in a mobile-first interface.

## Features

- 🌍 **World ID Integration** - Secure identity verification using World ID
- 💳 **Wallet Authentication** - Connect and authenticate with crypto wallets
- 📝 **Tweet Creation** - Share thoughts with the world (280 character limit)
- ❤️ **Social Interactions** - Like, retweet, and reply to posts
- � **User Profiles** - Complete profile pages with user stats and tweet history
- ✅ **Verified Human Badges** - Visual indicators for World ID verified users
- �📱 **Mobile-First Design** - Optimized for World App mobile experience
- 🔒 **Privacy-Focused** - Built with privacy and security in mind
- ⚡ **Real-time Updates** - Instant feed updates and notifications

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: World ID + Wallet Connect via minikit-js
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- World App for testing (or World App Simulator)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd H
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in World App or your browser.

### Testing World ID Authentication

#### Using World App
1. Install World App on your mobile device
2. Navigate to the app URL in World App's browser
3. Use the "Verify with World ID" button to scan QR codes
4. Test the authentication flows and social features

#### Development Mode
- The app includes a development fallback that allows authentication even if World ID verification fails
- Users created through World ID verification get "Verified Human" badges
- All users get randomized avatar images and can access profile features

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── tweets/        # Tweet CRUD operations
│   │   ├── verify-world-id/   # World ID verification
│   │   ├── verify-wallet-auth/ # Wallet authentication
│   │   └── nonce/         # Nonce generation for wallet auth
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main feed page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── providers/        # React context providers
│   ├── tweet/            # Tweet-related components
│   └── ui/               # Reusable UI components
├── store/                # Zustand state management
│   ├── userStore.ts      # User authentication state
│   └── tweetStore.ts     # Tweet management state
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_WORLD_APP_ID=your_world_app_id
NEXT_PUBLIC_MINIKIT_APP_ID=your_minikit_app_id
WORLD_ID_ACTION_ID=your_world_id_action
```

### World App Integration

1. Register your app in the World Developer Portal
2. Configure the app ID and action ID in your environment variables
3. Set up the minikit-js configuration in `MiniKitProvider.tsx`

## API Endpoints

- `GET /api/tweets` - Fetch paginated tweets
- `POST /api/tweets` - Create a new tweet
- `POST /api/verify-world-id` - Verify World ID proof
- `POST /api/verify-wallet-auth` - Verify wallet signature
- `GET /api/nonce` - Generate authentication nonce

## Key Components

### Authentication (`AuthButton.tsx`)
- Handles both World ID and wallet authentication
- Manages user login state and verification
- Provides seamless authentication experience

### Tweet Management (`TweetCard.tsx`, `ComposeTweet.tsx`)
- Tweet display with social actions (like, retweet, share)
- Tweet composition with character limit and media support
- Real-time interaction updates

### State Management
- **User Store**: Authentication state, user profile data
- **Tweet Store**: Tweet feed, pagination, social interactions

## Deployment

The application is designed to be deployed on platforms like Vercel, Netlify, or any Node.js hosting service.

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support and questions:
- Create an issue in this repository
- Check the World App documentation
- Review the minikit-js documentation

llm instruct: https://docs.world.org/llms-full.txt  
docs: https://docs.world.org/mini-apps/quick-start/installing  
minikit-js: https://github.com/worldcoin/minikit-js  
apple og logo process to make: https://www.youtube.com/watch?v=lg5R9PCaMBU  
