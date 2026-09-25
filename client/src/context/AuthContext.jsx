import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, setToken, removeToken, getToken, getActivePortal, setActivePortal } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredAlert, setSessionExpiredAlert] = useState(false);

  const initAuth = async () => {
    const portal = getActivePortal();
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.ok && res.data.success && res.data.user) {
        // If this tab specifies a portal (e.g. ?portal=admin), verify the user role matches
        if (portal && res.data.user.role !== portal) {
          const roleToken = localStorage.getItem(`rbac_token_${portal}`);
          if (roleToken && roleToken !== token) {
            sessionStorage.setItem('rbac_token', roleToken);
            const retryRes = await authService.getMe();
            if (retryRes.ok && retryRes.data.success && retryRes.data.user.role === portal) {
              setUser(retryRes.data.user);
              setActivePortal(retryRes.data.user.role);
              setLoading(false);
              return;
            }
          }
          // Token in this tab doesn't match the tab's portal, prompt login for this portal
          sessionStorage.removeItem('rbac_token');
          setUser(null);
        } else {
          setUser(res.data.user);
          setActivePortal(res.data.user.role);
        }
      } else {
        removeToken();
        setUser(null);
      }
    } catch (e) {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    const handleSessionExpired = (e) => {
      setSessionExpiredAlert(true);
      removeToken(user?.role);
      setUser(null);
    };

    window.addEventListener('rbac:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('rbac:session_expired', handleSessionExpired);
    };
  }, []);

  const login = async (email, password) => {
    setSessionExpiredAlert(false);
    const res = await authService.login(email, password);
    if (res.ok && res.data.success) {
      setToken(res.data.token, res.data.user.role);
      setActivePortal(res.data.user.role);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return { 
      success: false, 
      message: res.data.message || 'Login failed', 
      code: res.data.code 
    };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignored on logout
    }
    removeToken(user?.role);
    setUser(null);
    setSessionExpiredAlert(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      sessionExpiredAlert,
      dismissSessionAlert: () => setSessionExpiredAlert(false),
      refreshUser: initAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
