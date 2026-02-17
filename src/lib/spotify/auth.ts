// ─── Spotify OAuth 2.0 PKCE Flow ───
// Runs entirely in the browser — no backend needed.

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-library-read",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
].join(" ");

function getClientId(): string {
  const id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  console.log("DEBUG: Client ID from env:", id);
  console.log("DEBUG: All NEXT_PUBLIC env vars:", Object.keys(process.env).filter(k => k.startsWith("NEXT_PUBLIC")));
  if (!id || id === "your_client_id_here") {
    throw new Error(
      "NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set. Edit .env.local with your Spotify Client ID, then restart the dev server (npm run dev)."
    );
  }
  return id;
}

function getRedirectUri(): string {
  if (process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  }
  // Fallback: derive from current URL (client-side only)
  if (typeof window !== "undefined") {
    return `${window.location.origin}/callback`;
  }
  return "http://localhost:3000/callback";
}

/** Generate a random code verifier for PKCE */
function generateCodeVerifier(length = 128): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => possible[v % possible.length]).join("");
}

/** SHA-256 hash → base64url encode for PKCE code challenge */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Redirect the user to Spotify's auth page.
 * Stores the code verifier in localStorage for the callback.
 */
export async function redirectToSpotifyAuth(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange the authorization code for an access token.
 * Called on the /callback page after Spotify redirects back.
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const verifier = localStorage.getItem("spotify_code_verifier");
  if (!verifier) throw new Error("No code verifier found in localStorage");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Token exchange failed: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  localStorage.removeItem("spotify_code_verifier");

  // Persist tokens
  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem("spotify_refresh_token", data.refresh_token);
  localStorage.setItem(
    "spotify_token_expiry",
    String(Date.now() + data.expires_in * 1000)
  );

  return data;
}

/**
 * Refresh the access token using the stored refresh token.
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();

  localStorage.setItem("spotify_access_token", data.access_token);
  if (data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }
  localStorage.setItem(
    "spotify_token_expiry",
    String(Date.now() + data.expires_in * 1000)
  );

  return data.access_token;
}

/**
 * Get a valid access token, refreshing if expired.
 */
export async function getAccessToken(): Promise<string | null> {
  const token = localStorage.getItem("spotify_access_token");
  const expiry = localStorage.getItem("spotify_token_expiry");

  if (!token) return null;

  // Refresh if expiring within 60 seconds
  if (expiry && Date.now() > Number(expiry) - 60_000) {
    try {
      return await refreshAccessToken();
    } catch {
      clearTokens();
      return null;
    }
  }

  return token;
}

/**
 * Clear all stored tokens (logout).
 */
export function clearTokens(): void {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_token_expiry");
  localStorage.removeItem("spotify_code_verifier");
}

/**
 * Check if the user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("spotify_access_token");
}
