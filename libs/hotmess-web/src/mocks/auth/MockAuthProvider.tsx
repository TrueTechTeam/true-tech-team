import { createContext, useContext, useState, type ReactNode } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { MOCK_USERS, DEFAULT_MOCK_USER } from './mock-users';
import { UserRole } from '@true-tech-team/hotmess-types';

interface MockAuthState {
  role: UserRole;
  isAuthenticated: boolean;
}

// Separate context for the dev role switcher
interface MockAuthControl {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const MockAuthControlContext = createContext<MockAuthControl>({
  role: UserRole.Admin,
  setRole: () => {},
});

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockAuthState>({
    role: DEFAULT_MOCK_USER.role,
    isAuthenticated: true,
  });

  const currentUser = MOCK_USERS[state.role];

  const signInWithSportsEngine = () => {
    setState((prev) => ({ ...prev, isAuthenticated: true }));
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
  };

  const refreshProfile = async () => {
    // No-op in mock mode
  };

  const getAccessToken = async () => {
    return state.isAuthenticated ? 'mock-token-hotmess-dev' : null;
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.isAuthenticated ? currentUser.sportsEngineUser : null,
        profile: state.isAuthenticated ? currentUser.profile : null,
        loading: false,
        isAuthenticated: state.isAuthenticated,
        signInWithSportsEngine,
        signOut,
        refreshProfile,
        getAccessToken,
      }}
    >
      <MockAuthControlContext.Provider
        value={{
          role: state.role,
          setRole: (role) => setState({ role, isAuthenticated: true }),
        }}
      >
        {children}
      </MockAuthControlContext.Provider>
    </AuthContext.Provider>
  );
}

export function useMockAuth() {
  return useContext(MockAuthControlContext);
}
