import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('studyvault_token'));
  const [loading, setLoading] = useState(true);
  const [isDev] = useState(import.meta.env.MODE !== 'production');

  const fetchCurrentUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.warn('Failed to restore session:', err.message);
      localStorage.removeItem('studyvault_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('studyvault_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    localStorage.setItem('studyvault_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('studyvault_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (targetRole) => {
    if (!isDev) {
      throw new Error('Demo switching is only permitted in development mode');
    }

    const data = await apiFetch('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role: targetRole }),
    });

    localStorage.setItem('studyvault_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const googleAuthMockOrToken = async (googleData) => {
    const data = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });

    localStorage.setItem('studyvault_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const updateSemester = async (newSemester) => {
    const data = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ semester: newSemester }),
    });
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDev,
        login,
        register,
        logout,
        switchDemoRole,
        googleAuthMockOrToken,
        updateSemester,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
