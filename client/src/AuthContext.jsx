import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api('/api/users/profile')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const data = await api(path, { method: 'POST', body });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    loading,
    login: (email, password) => authenticate('/api/auth/login', { email, password }),
    register: (fields) => authenticate('/api/auth/register', fields),
    logout: () => { setToken(null); setUser(null); },
    updateUser: setUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
