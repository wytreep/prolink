import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { api } from '@/lib/api';
import { readJSON, removeKey, secureGet, secureSet, writeJSON } from '@/lib/storage';
import type { AuthResponse, User } from '@/types';

const TOKEN_KEY = 'prolink.token';
const USER_KEY = 'prolink.user';
const DEMO_KEY = 'prolink.demo';

const DEMO_USER: User = {
  id: 'demo',
  name: 'Laura Gómez',
  email: 'laura.gomez@uniajc.edu.co',
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isDemo: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  scope: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [storedToken, storedUser, storedDemo] = await Promise.all([
        secureGet(TOKEN_KEY),
        readJSON<User | null>(USER_KEY, null),
        readJSON<boolean>(DEMO_KEY, false),
      ]);
      if (!active) return;
      if (storedDemo && storedUser) {
        setUser(storedUser);
        setIsDemo(true);
        setToken(null);
      } else if (storedToken && storedUser) {
        setUser(storedUser);
        setToken(storedToken);
        setIsDemo(false);
      }
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (auth: AuthResponse | null, demo: boolean) => {
    await Promise.all([
      secureSet(TOKEN_KEY, auth?.token ?? null),
      writeJSON(USER_KEY, auth?.user ?? null),
      writeJSON(DEMO_KEY, demo),
    ]);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const auth = await api.login(email.trim().toLowerCase(), password);
      setUser(auth.user);
      setToken(auth.token);
      setIsDemo(false);
      await persist(auth, false);
    },
    [persist],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const auth = await api.register(name.trim(), email.trim().toLowerCase(), password);
      setUser(auth.user);
      setToken(auth.token);
      setIsDemo(false);
      await persist(auth, false);
    },
    [persist],
  );

  const signInDemo = useCallback(async () => {
    setUser(DEMO_USER);
    setToken(null);
    setIsDemo(true);
    await Promise.all([
      secureSet(TOKEN_KEY, null),
      writeJSON(USER_KEY, DEMO_USER),
      writeJSON(DEMO_KEY, true),
    ]);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setToken(null);
    setIsDemo(false);
    await Promise.all([secureSet(TOKEN_KEY, null), removeKey(USER_KEY), removeKey(DEMO_KEY)]);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isDemo,
      isLoading,
      isAuthenticated: !!user,
      scope: user?.id ?? 'guest',
      signIn,
      signUp,
      signInDemo,
      signOut,
    }),
    [user, token, isDemo, isLoading, signIn, signUp, signInDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
