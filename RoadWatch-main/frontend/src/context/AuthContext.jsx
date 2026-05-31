import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/authApi';
import { clearTokens, hasTokens } from '../services/authStorage';

const AuthContext = createContext(null);

export const ROLES = {
  CITIZEN: 'Citizen',
  OFFICER: 'Road Authority Officer',
  ADMIN: 'Admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!hasTokens()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const onExpired = () => {
      setUser(null);
    };
    window.addEventListener('roadwatch:auth-expired', onExpired);
    return () => window.removeEventListener('roadwatch:auth-expired', onExpired);
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const data = await apiRegister(email, password, fullName);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      reloadUser: loadUser,
      isCitizen: user?.role === ROLES.CITIZEN,
      isOfficer: user?.role === ROLES.OFFICER,
      isAdmin: user?.role === ROLES.ADMIN,
    }),
    [user, loading, login, register, logout, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
