import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../api/services/authService';

/**
 * AuthContext manages auth state (token + user) and exposes login/signup/logout.
 * Token is persisted in localStorage for use by Axios interceptor.
 */

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  token: null,
  user: null,
  isAuthenticated: false,
  login: async (_creds) => {},
  signup: async (_payload) => {},
  logout: () => {},
});

// PUBLIC_INTERFACE
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    if (data?.token) setToken(data.token);
    if (data?.user) setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authService.signup(payload);
    // Some backends return token on signup; handle if present
    if (data?.token) setToken(data.token);
    if (data?.user) setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout,
    }),
    [token, user, login, signup, logout]
  );

  // On app mount once, attempt health check (non-blocking)
  useEffect(() => {
    (async () => {
      try {
        // lazy import to avoid circular deps
        const { default: authSvc } = await import('../api/services/authService');
        await authSvc.health();
        // eslint-disable-next-line no-console
        console.log('[API] Health check OK');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[API] Health check failed', e);
      }
    })();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// PUBLIC_INTERFACE
export const useAuth = () => useContext(AuthContext);
