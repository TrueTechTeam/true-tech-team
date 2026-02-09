// Sports Engine OAuth 2.0 Configuration
// Documentation: https://help.sportsengine.com/en/articles/8891727-authenticating-with-sportsengine

const SPORTS_ENGINE_AUTH_URL = 'https://user.sportsengine.com/oauth/authorize';
const SPORTS_ENGINE_TOKEN_URL = 'https://user.sportsengine.com/oauth/token';
const SPORTS_ENGINE_ME_URL = 'https://user.sportsengine.com/oauth/me';

// Environment variables
const CLIENT_ID = import.meta.env.VITE_SPORTS_ENGINE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPORTS_ENGINE_CLIENT_SECRET;
const REDIRECT_URI =
  import.meta.env.VITE_SPORTS_ENGINE_REDIRECT_URI || `${window.location.origin}/auth/callback`;

if (!CLIENT_ID) {
  console.warn('Missing VITE_SPORTS_ENGINE_CLIENT_ID environment variable');
}

export interface SportsEngineTokens {
  access_token: string;
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

export interface SportsEngineUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

/**
 * Build the Sports Engine authorization URL
 * Redirects user to Sports Engine for login
 */
export function getSportsEngineAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID || '',
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
  });

  if (state) {
    params.set('state', state);
  }

  return `${SPORTS_ENGINE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * This should be called from a server-side function to protect client_secret
 */
export async function exchangeCodeForTokens(code: string): Promise<SportsEngineTokens> {
  const response = await fetch('/api/auth/sports-engine/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to exchange code for tokens');
  }

  return response.json();
}

/**
 * Get the current user's Sports Engine profile
 */
export async function getSportsEngineUser(accessToken: string): Promise<SportsEngineUser> {
  const response = await fetch(SPORTS_ENGINE_ME_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Sports Engine user');
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 * This should be called from a server-side function to protect client_secret
 */
export async function refreshAccessToken(refreshToken: string): Promise<SportsEngineTokens> {
  const response = await fetch('/api/auth/sports-engine/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to refresh token');
  }

  return response.json();
}

/**
 * Initiate Sports Engine login
 * Generates a state parameter for CSRF protection and redirects to Sports Engine
 */
export function initiateLogin(returnTo?: string): void {
  // Generate random state for CSRF protection
  const state = btoa(
    JSON.stringify({
      nonce: crypto.randomUUID(),
      returnTo: returnTo || '/admin',
    })
  );

  // Store state in sessionStorage to verify on callback
  sessionStorage.setItem('sports_engine_oauth_state', state);

  // Redirect to Sports Engine
  window.location.href = getSportsEngineAuthUrl(state);
}

/**
 * Validate the OAuth state parameter
 */
export function validateState(returnedState: string): { valid: boolean; returnTo?: string } {
  const storedState = sessionStorage.getItem('sports_engine_oauth_state');
  sessionStorage.removeItem('sports_engine_oauth_state');

  if (!storedState || storedState !== returnedState) {
    return { valid: false };
  }

  try {
    const parsed = JSON.parse(atob(returnedState));
    return { valid: true, returnTo: parsed.returnTo };
  } catch {
    return { valid: false };
  }
}
