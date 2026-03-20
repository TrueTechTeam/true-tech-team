/**
 * Feature flags for development/testing.
 * Uses EXPO_PUBLIC_* env vars (Expo's public env var convention).
 * When removing mocks, delete this file and search for 'feature-flags' imports.
 */
export const featureFlags = {
  useMockAuth: process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true',
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
} as const;
