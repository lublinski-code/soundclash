#!/bin/bash
# Fix Environment Script for SoundClash
# Run this script whenever the environment breaks

set -e

echo "🔧 Fixing SoundClash environment..."

# 1. Stop any running dev servers
echo "📛 Stopping any running dev servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# 2. Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
echo "✓ Cache cleared"

# 3. Check if node_modules exists and is valid
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi

# 4. Check environment variables
echo "🔐 Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  WARNING: .env.local file not found!"
    echo "   Create .env.local with:"
    echo "   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here"
    echo "   NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback"
else
    if grep -q "your_client_id_here" .env.local 2>/dev/null; then
        echo "⚠️  WARNING: .env.local contains placeholder values!"
        echo "   Please update with your actual Spotify Client ID"
    else
        echo "✓ Environment variables configured"
    fi
fi

# 5. Verify TypeScript compilation
echo "🔍 Checking TypeScript..."
npx tsc --noEmit --skipLibCheck 2>&1 | head -20 || echo "⚠️  TypeScript errors found (may be non-critical)"

# 6. Ready to start
echo ""
echo "✅ Environment fixed!"
echo ""
echo "To start the dev server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at: http://127.0.0.1:3000"
echo ""
