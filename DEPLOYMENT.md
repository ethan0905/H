# Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/world-social-app)

1. Click the "Deploy" button above
2. Connect your GitHub account
3. Set up environment variables:
   - `NEXT_PUBLIC_WORLD_APP_ID`
   - `NEXT_PUBLIC_MINIKIT_APP_ID` 
   - `WORLD_ID_ACTION_ID`
4. Deploy!

## Manual Deployment

### Prerequisites
- Node.js 18+
- Your World App registered in the World Developer Portal

### Steps

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd world-social-app
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. **Build the application:**
```bash
npm run build
```

4. **Start the production server:**
```bash
npm start
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WORLD_APP_ID` | Your World App ID from the developer portal | Yes |
| `NEXT_PUBLIC_MINIKIT_APP_ID` | Same as World App ID | Yes |
| `WORLD_ID_ACTION_ID` | Action ID for World ID verification | Yes |

### Deployment Platforms

#### Vercel (Recommended)
- Connect your GitHub repository
- Add environment variables in dashboard
- Automatic deployments on push

#### Netlify
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `.next`
- Add environment variables

#### Railway
- Connect GitHub repository
- Add environment variables
- Automatic deployments

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### World App Configuration

1. **Register your app** in the World Developer Portal
2. **Set app URL** to your deployed domain
3. **Configure permissions** (World ID, wallet access)
4. **Test in World App** mobile browser

### Testing

1. **Local testing:**
   - Use World App Simulator
   - Test authentication flows
   - Verify API endpoints

2. **Production testing:**
   - Test in actual World App
   - Verify World ID integration
   - Test wallet connections

### Troubleshooting

#### Common Issues

1. **MiniKit not loading:**
   - Verify World App ID is correct
   - Check console for errors
   - Ensure HTTPS in production

2. **World ID verification failing:**
   - Check action ID configuration
   - Verify proof format
   - Test with World ID Simulator

3. **Build errors:**
   - Ensure all dependencies installed
   - Check TypeScript errors
   - Verify environment variables

#### Support Resources

- [World App Documentation](https://docs.worldcoin.org/minikit)
- [MiniKit.js Reference](https://docs.worldcoin.org/minikit/js)
- [Next.js Documentation](https://nextjs.org/docs)

### Performance Optimization

- Enable caching for API routes
- Optimize images with Next.js Image component
- Use proper loading states
- Implement error boundaries
- Add service worker for offline support
