"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import { getAccessToken, removeAccessToken, removeRefreshToken } from '@/lib/tokens';
import { getProfile } from '@/services/accounts';
import eventEmitter from '@/lib/event-emitter';


interface AuthContextType {
  user: User | undefined;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [user, setUser] = useState<User>();

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      getProfile()
      .then(response => {
        setUser(response.data);
      })
    }

    eventEmitter.addEventListener('logout', logout);
    return () => {
      eventEmitter.removeEventListener('logout', logout);
    }
  }, []);

  function login(user: User) {
    setUser(user);
  }

  function logout() {
    setUser(undefined);
    removeAccessToken();
    removeRefreshToken();
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}