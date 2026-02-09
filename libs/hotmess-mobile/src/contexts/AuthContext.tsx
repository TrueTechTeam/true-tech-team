import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  exchangeCodeForTokens,
  getSportsEngineUser,
  refreshAccessToken,
  type SportsEngineTokens,
  type SportsEngineUser,
} from '../lib/sports-engine';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  preferred_name?: string;
  avatar_url?: string;
  is_onboarded: boolean;
  sports_engine_id?: string;
}

interface AuthContextType {
  user: SportsEngineUser | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  handleAuthCode: (code: string, redirectUri: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Storage keys
const TOKEN_KEY = 'hotmess_se_tokens';
const USER_KEY = 'hotmess_se_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SportsEngineUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tokens, setTokens] = useState<SportsEngineTokens | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create user profile in Supabase
  const fetchProfile = useCallback(async (sportsEngineUser: SportsEngineUser) => {
    try {
      // First try to find existing profile by sports_engine_id
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('sports_engine_id', sportsEngineUser.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile as Profile);
        return existingProfile as Profile;
      }

      // If not found, create a new profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          sports_engine_id: sportsEngineUser.id,
          email: sportsEngineUser.email,
          first_name: sportsEngineUser.first_name,
          last_name: sportsEngineUser.last_name,
          avatar_url: sportsEngineUser.avatar_url,
          is_onboarded: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }

      setProfile(newProfile as Profile);
      return newProfile as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Handle token refresh
  const handleTokenRefresh = useCallback(
    async (refreshToken: string) => {
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        setTokens(newTokens);
        await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));

        // Re-fetch user info
        const userInfo = await getSportsEngineUser(newTokens.access_token);
        setUser(userInfo);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo));
        await fetchProfile(userInfo);
        return true;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        await clearAuth();
        return false;
      }
    },
    [fetchProfile]
  );

  // Clear all auth data
  const clearAuth = async () => {
    setUser(null);
    setProfile(null);
    setTokens(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  };

  // Load stored tokens and user on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens) as SportsEngineTokens;
          const parsedUser = JSON.parse(storedUser) as SportsEngineUser;

          // Check if token is expired
          if (parsedTokens.expires_at * 1000 > Date.now()) {
            setTokens(parsedTokens);
            setUser(parsedUser);
            await fetchProfile(parsedUser);
          } else {
            // Try to refresh the token
            await handleTokenRefresh(parsedTokens.refresh_token);
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        await clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchProfile, handleTokenRefresh]);

  // Handle OAuth authorization code
  const handleAuthCode = async (code: string, redirectUri: string) => {
    setLoading(true);

    try {
      // Exchange code for tokens
      const newTokens = await exchangeCodeForTokens(code, redirectUri);
      setTokens(newTokens);
      await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));

      // Fetch user info from Sports Engine
      const userInfo = await getSportsEngineUser(newTokens.access_token);
      setUser(userInfo);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo));

      // Create/update profile in Supabase
      await fetchProfile(userInfo);
    } catch (error) {
      console.error('Auth code exchange error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    await clearAuth();
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // Get current access token (refreshes if needed)
  const getAccessToken = async (): Promise<string | null> => {
    if (!tokens) return null;

    // Check if token is about to expire (within 5 minutes)
    const expiresIn = tokens.expires_at * 1000 - Date.now();
    if (expiresIn < 5 * 60 * 1000 && tokens.refresh_token) {
      const success = await handleTokenRefresh(tokens.refresh_token);
      if (!success) return null;
    }

    return tokens?.access_token || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        handleAuthCode,
        signOut,
        refreshProfile,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
