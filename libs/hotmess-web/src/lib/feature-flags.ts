/**
 * Feature flags for development/testing.
 * When removing mocks, delete this file and search for 'feature-flags' imports.
 */
export const featureFlags = {
  useMockAuth: import.meta.env.VITE_USE_MOCK_AUTH === 'true',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
} as const;
