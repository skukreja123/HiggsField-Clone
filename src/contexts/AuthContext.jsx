import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { clearSession, getSession, setSession } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession()?.user ?? null);
  const [token, setToken] = useState(() => getSession()?.token ?? null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const session = getSession();
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        setUser(data.user);
        setSession(session.token, data.user);
      } catch {
        clearSession();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    setSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (form) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    setSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // no-op for session cleanup
    } finally {
      clearSession();
      setUser(null);
      setToken(null);
    }
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
