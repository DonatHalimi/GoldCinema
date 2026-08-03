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

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    setUser(data.user);
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
    <AuthContext.Provider value={{ user, setUser, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);