#!/bin/bash

echo "🌍 H World - Ngrok Tunnel Setup"
echo "================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo "📦 Installing ngrok..."
    brew install ngrok
fi

# Check if server is running on port 3000
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  No server running on port 3000"
    echo "🚀 Starting production server..."
    cd /Users/ethan/Desktop/H
    npm start &
    SERVER_PID=$!
    echo "⏳ Waiting for server to start..."
    sleep 5
fi

echo "✅ Server is running on port 3000"
echo ""
echo "🌐 Starting ngrok tunnel..."
echo "   This will expose your local server to the internet"
echo ""
echo "📋 Instructions:"
echo "   1. Copy the 'Forwarding' URL from ngrok (https://xxxx.ngrok.io)"
echo "   2. Go to https://developer.worldcoin.org/"
echo "   3. Navigate to your app → Test"
echo "   4. Paste the ngrok URL"
echo "   5. Scan the QR code with World App"
echo "   6. Tap the Eruda icon (bottom-right) to see console logs"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""
echo "================================"
echo ""

# Start ngrok
ngrok http 3000
