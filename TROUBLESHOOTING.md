# Troubleshooting Guide

## Quick Fix Script

If something breaks, run:
```bash
./fix-env.sh
```

This script will:
- Stop any running dev servers
- Clean the build cache
- Reinstall dependencies if needed
- Check environment variables
- Verify TypeScript compilation

## Common Issues & Solutions

### 1. 404 Error on Root Page

**Symptoms:** Getting 404 when accessing `http://127.0.0.1:3000`

**Solutions:**
```bash
# Clean cache and restart
rm -rf .next
npm run dev
```

**Root Cause:** Next.js cache can get corrupted, especially after file changes or git operations.

### 2. Environment Variables Not Loading

**Symptoms:** Errors about `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` not set

**Solutions:**
1. Ensure `.env.local` exists in the project root
2. Restart the dev server after changing `.env.local`
3. Check that variables start with `NEXT_PUBLIC_` for client-side access

**Required Variables:**
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### 3. Port Already in Use

**Symptoms:** "Port 3000 is in use" error

**Solutions:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### 4. Module Not Found Errors

**Symptoms:** Import errors, missing modules

**Solutions:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 5. TypeScript Errors

**Symptoms:** Type errors preventing compilation

**Solutions:**
```bash
# Check for errors
npx tsc --noEmit

# If errors persist, try:
rm -rf .next
npm run dev
```

### 6. "Too Many Open Files" Warning

**Symptoms:** Watchpack errors about EMFILE

**Solutions:**
- This is usually a macOS file watcher limit issue
- The app should still work despite these warnings
- To fix permanently:
  ```bash
  # Increase file limit (add to ~/.zshrc or ~/.bash_profile)
  ulimit -n 4096
  ```

## Standard Startup Procedure

1. **Always start fresh:**
   ```bash
   ./fix-env.sh
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Open `http://127.0.0.1:3000` in your browser
   - Check the terminal for any errors

## If Nothing Works

1. **Complete reset:**
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run dev
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 18.x or 20.x
   ```

3. **Check for conflicting processes:**
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```

## Getting Help

If issues persist:
1. Check the terminal output for specific error messages
2. Look at browser console for client-side errors
3. Verify `.env.local` is properly configured
4. Ensure all dependencies are installed (`npm install`)
