// Sports Engine OAuth 2.0 Configuration for React Native
// Documentation: https://help.sportsengine.com/en/articles/8891727-authenticating-with-sportsengine

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Ensure web browser redirects work on web
WebBrowser.maybeCompleteAuthSession();

const SPORTS_ENGINE_AUTH_URL = 'https://user.sportsengine.com/oauth/authorize';
const SPORTS_ENGINE_TOKEN_URL = 'https://user.sportsengine.com/oauth/token';
const SPORTS_ENGINE_ME_URL = 'https://user.sportsengine.com/oauth/me';

// Environment variables
const CLIENT_ID = process.env.EXPO_PUBLIC_SPORTS_ENGINE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPORTS_ENGINE_CLIENT_SECRET || '';

if (!CLIENT_ID) {
  console.warn('Missing EXPO_PUBLIC_SPORTS_ENGINE_CLIENT_ID environment variable');
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

// Create OAuth discovery document
export const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: SPORTS_ENGINE_AUTH_URL,
  tokenEndpoint: SPORTS_ENGINE_TOKEN_URL,
};

// Get the redirect URI for the current platform
export function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: 'hotmess',
    path: 'auth/callback',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<SportsEngineTokens> {
  const response = await fetch(SPORTS_ENGINE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token exchange failed:', error);
    throw new Error('Failed to exchange code for tokens');
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
 */
export async function refreshAccessToken(refreshToken: string): Promise<SportsEngineTokens> {
  const response = await fetch(SPORTS_ENGINE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh token');
  }

  return response.json();
}

/**
 * Build the auth request config
 */
export function getAuthRequestConfig(redirectUri: string): AuthSession.AuthRequestConfig {
  return {
    clientId: CLIENT_ID,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    scopes: [],
  };
}
