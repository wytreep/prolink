import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { defaultCV } from '@/data/demo';
import { readJSON, writeJSON } from '@/lib/storage';
import type { CVData } from '@/types';
import { useAuth } from './AuthContext';

type CVContextValue = {
  cv: CVData;
  isLoaded: boolean;
  completeness: number;
  updateCV: (patch: Partial<CVData> | ((prev: CVData) => CVData)) => void;
};

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: PropsWithChildren) {
  const { user, isDemo, scope } = useAuth();
  const storageKey = `prolink.cv:${scope}`;
  const [cv, setCv] = useState<CVData>(() =>
    defaultCV(user?.name ?? '', user?.email ?? '', isDemo),
  );
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoaded = loadedKey === storageKey;

  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await readJSON<CVData | null>(storageKey, null);
      if (!active) return;
      setCv(stored ?? defaultCV(user?.name ?? '', user?.email ?? '', isDemo));
      setLoadedKey(storageKey);
    })();
    return () => {
      active = false;
    };
  }, [storageKey, user?.name, user?.email, isDemo]);

  useEffect(() => {
    if (isLoaded) void writeJSON(storageKey, cv);
  }, [cv, isLoaded, storageKey]);

  const updateCV = useCallback((patch: Partial<CVData> | ((prev: CVData) => CVData)) => {
    setCv((prev) => (typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }));
  }, []);

  const completeness = useMemo(() => {
    const checks = [
      cv.fullName.trim().length > 2,
      cv.headline.trim().length > 3,
      /\S+@\S+\.\S+/.test(cv.email),
      cv.phone.trim().length >= 7,
      cv.city.trim().length > 2,
      cv.summary.trim().length >= 40,
      cv.skills.length >= 3,
      cv.experience.length > 0,
      cv.education.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [cv]);

  const value = useMemo<CVContextValue>(
    () => ({ cv, isLoaded, completeness, updateCV }),
    [cv, isLoaded, completeness, updateCV],
  );

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

export function useCV(): CVContextValue {
  const context = useContext(CVContext);
  if (!context) throw new Error('useCV debe usarse dentro de <CVProvider>');
  return context;
}
