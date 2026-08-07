import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    });

    return data;
  }

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  };

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    if (data.mfaRequired) return data;
    setUser(data.user);
    return data;
  };

  const verifyLoginMfa = async (
    mfaToken,
    code,
    rememberMe,
    trustDevice
  ) => {
    const response = await api.post('/auth/2fa/verify-login', {
      mfaToken,
      code,
      rememberMe,
      trustDevice,
    });

    const { data } = await api.get('/auth/me');

    setUser(data.user);

    return response.data;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    setUser(data.user);
    return data;
  };

  const loginWithFacebook = async (accessToken) => {
    const { data } = await api.post('/auth/facebook', { accessToken });
    setUser(data.user);
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
    setUser(null);
    return data;
  };

  const deleteAccount = async (password) => {
    const { data } = await api.delete('/auth/account', { data: { password } });
    setUser(null);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-marquee-bg text-marquee-gold">
        Loading session...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, register, forgotPassword, resetPassword, login, verifyLoginMfa, changePassword, deleteAccount, loginWithGoogle, loginWithFacebook, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);