import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { demoApplications } from '@/data/demo';
import { readJSON, writeJSON } from '@/lib/storage';
import type { Application, Offer } from '@/types';
import { useAuth } from './AuthContext';

type OffersContextValue = {
  savedOfferIds: string[];
  applications: Application[];
  isLoaded: boolean;
  savedCount: number;
  activeApplications: number;
  isSaved: (offerId: string) => boolean;
  toggleSaved: (offerId: string) => void;
  hasApplied: (offerId: string) => boolean;
  applyToOffer: (offer: Offer, matchPct: number) => boolean;
};

const OffersContext = createContext<OffersContextValue | null>(null);

export function OffersProvider({ children }: PropsWithChildren) {
  const { isDemo, scope } = useAuth();
  const savedKey = `prolink.saved:${scope}`;
  const applicationsKey = `prolink.applications:${scope}`;
  const [savedOfferIds, setSavedOfferIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loadKey = `${savedKey}|${applicationsKey}`;
  const isLoaded = loadedKey === loadKey;

  useEffect(() => {
    let active = true;
    (async () => {
      const [storedSaved, storedApplications] = await Promise.all([
        readJSON<string[]>(savedKey, []),
        readJSON<Application[] | null>(applicationsKey, null),
      ]);
      if (!active) return;
      setSavedOfferIds(storedSaved);
      if (storedApplications === null) {
        setApplications(isDemo ? demoApplications() : []);
      } else {
        setApplications(storedApplications);
      }
      setLoadedKey(`${savedKey}|${applicationsKey}`);
    })();
    return () => {
      active = false;
    };
  }, [savedKey, applicationsKey, isDemo]);

  useEffect(() => {
    if (isLoaded) void writeJSON(savedKey, savedOfferIds);
  }, [savedOfferIds, isLoaded, savedKey]);

  useEffect(() => {
    if (isLoaded) void writeJSON(applicationsKey, applications);
  }, [applications, isLoaded, applicationsKey]);

  const isSaved = useCallback(
    (offerId: string) => savedOfferIds.includes(offerId),
    [savedOfferIds],
  );

  const toggleSaved = useCallback((offerId: string) => {
    setSavedOfferIds((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [offerId, ...prev],
    );
  }, []);

  const hasApplied = useCallback(
    (offerId: string) => applications.some((application) => application.offerId === offerId),
    [applications],
  );

  const applyToOffer = useCallback(
    (offer: Offer, matchPct: number): boolean => {
      if (applications.some((application) => application.offerId === offer.id)) return false;
      const application: Application = {
        id: Crypto.randomUUID(),
        offerId: offer.id,
        offerTitle: offer.title,
        company: offer.company,
        status: 'en_revision',
        appliedAt: new Date().toISOString(),
        matchPct,
      };
      setApplications((prev) => [application, ...prev]);
      return true;
    },
    [applications],
  );

  const value = useMemo<OffersContextValue>(
    () => ({
      savedOfferIds,
      applications,
      isLoaded,
      savedCount: savedOfferIds.length,
      activeApplications: applications.filter(
        (application) => application.status !== 'no_seleccionada',
      ).length,
      isSaved,
      toggleSaved,
      hasApplied,
      applyToOffer,
    }),
    [savedOfferIds, applications, isLoaded, isSaved, toggleSaved, hasApplied, applyToOffer],
  );

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers(): OffersContextValue {
  const context = useContext(OffersContext);
  if (!context) throw new Error('useOffers debe usarse dentro de <OffersProvider>');
  return context;
}
