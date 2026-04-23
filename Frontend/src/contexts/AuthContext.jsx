import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginWithGoogle, loginWithPassword } from '../api/auth';
import { getStoredAuthToken, setStoredAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredAuthToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setStoredAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback((authPayload) => {
    setStoredAuthToken(authPayload.token);
    setToken(authPayload.token);
    setUser(authPayload.user);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function hydrateSession() {
      if (!token) {
        if (!ignore) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await getCurrentUser();
        if (!ignore) {
          setUser(me);
        }
      } catch {
        if (!ignore) {
          clearSession();
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    hydrateSession();

    return () => {
      ignore = true;
    };
  }, [token, clearSession]);

  const login = useCallback(
    async (email, password) => {
      const authPayload = await loginWithPassword(email, password);
      applySession(authPayload);
      return authPayload;
    },
    [applySession]
  );

  const loginWithGoogleToken = useCallback(
    async (idToken) => {
      const authPayload = await loginWithGoogle(idToken);
      applySession(authPayload);
      return authPayload;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const replaceUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      loginWithGoogleToken,
      logout,
      replaceUser
    }),
    [token, user, isLoading, login, loginWithGoogleToken, logout, replaceUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
