#!/bin/bash
# Reliable startup script for SoundClash
# This ensures a clean start every time

set -e

echo "🚀 Starting SoundClash..."

# Stop any existing servers
echo "📛 Stopping existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

# Clean cache (optional - uncomment if you want fresh start every time)
# echo "🧹 Cleaning cache..."
# rm -rf .next

# Start dev server
echo "▶️  Starting dev server..."
npm run dev
