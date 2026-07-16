import React, { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('erp_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.post('/auth/login', { email, password });
      const { token, user: loggedInUser } = res.data.data;
      localStorage.setItem('erp_token', token);
      localStorage.setItem('erp_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return true;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout');
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (code) => {
      // permissions aren't stored client-side by default; the backend
      // is the source of truth. This helper is best-effort for UI hints,
      // e.g. hiding buttons for non-admin roles.
      if (!user) return false;
      if (user.role_name === 'admin') return true;
      return false;
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
