import { useNetInfo } from '@react-native-community/netinfo';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { buildSampleTransactions, demoGoals } from '@/data/demo';
import { api, ApiError } from '@/lib/api';
import { buildLocalSummary } from '@/lib/budget';
import { currentMonth, todayAtNoonIso } from '@/lib/format';
import { readJSON, writeJSON } from '@/lib/storage';
import type {
  ApiSummary,
  ApiTransaction,
  Bucket,
  FinanceSummary,
  Goal,
  Transaction,
  TxType,
} from '@/types';
import { useAuth } from './AuthContext';

export type AddTransactionInput = {
  type: TxType;
  amountCop: number;
  description: string;
  bucket?: Bucket;
  date?: string;
};

type FinanceContextValue = {
  transactions: Transaction[];
  goals: Goal[];
  summary: FinanceSummary;
  month: string;
  isLoaded: boolean;
  isRefreshing: boolean;
  isSyncing: boolean;
  isOffline: boolean;
  pendingCount: number;
  lastError: string | null;
  setMonth: (month: string) => void;
  setLastError: (message: string | null) => void;
  refresh: () => Promise<void>;
  syncPending: () => Promise<{ synced: number }>;
  addTransaction: (input: AddTransactionInput) => Promise<Transaction>;
  loadSampleData: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  contributeToGoal: (id: string, amountCop: number) => void;
  deleteGoal: (id: string) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: PropsWithChildren) {
  const { token, isDemo, scope, signOut } = useAuth();
  const net = useNetInfo();
  const isOffline = net.isConnected === false || net.isInternetReachable === false;
  const transactionsKey = `prolink.finance.transactions:${scope}`;
  const goalsKey = `prolink.finance.goals:${scope}`;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [serverSummary, setServerSummary] = useState<{
    scope: string;
    summary: ApiSummary;
  } | null>(null);
  const txRef = useRef<Transaction[]>([]);
  const wasOffline = useRef(false);

  const isLoaded = loadedKey === `${transactionsKey}|${goalsKey}`;
  const currentServerSummary = serverSummary?.scope === scope ? serverSummary.summary : null;

  useEffect(() => {
    txRef.current = transactions;
  }, [transactions]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [storedTransactions, storedGoals] = await Promise.all([
        readJSON<Transaction[] | null>(transactionsKey, null),
        readJSON<Goal[] | null>(goalsKey, null),
      ]);
      if (!active) return;
      const monthNow = currentMonth();
      setLastError(null);
      setTransactions(
        storedTransactions === null
          ? isDemo
            ? buildSampleTransactions(monthNow, false)
            : []
          : storedTransactions,
      );
      setGoals(
        storedGoals === null ? (isDemo ? demoGoals() : []) : storedGoals,
      );
      setLoadedKey(`${transactionsKey}|${goalsKey}`);
    })();
    return () => {
      active = false;
    };
  }, [transactionsKey, goalsKey, isDemo]);

  useEffect(() => {
    if (isLoaded) void writeJSON(transactionsKey, transactions);
  }, [transactions, isLoaded, transactionsKey]);

  useEffect(() => {
    if (isLoaded) void writeJSON(goalsKey, goals);
  }, [goals, isLoaded, goalsKey]);

  const pendingCount = useMemo(
    () => transactions.filter((transaction) => transaction.pending).length,
    [transactions],
  );

  const localSummary = useMemo(
    () => buildLocalSummary(month, transactions),
    [month, transactions],
  );

  const summary = useMemo<FinanceSummary>(() => {
    if (pendingCount === 0 && currentServerSummary && currentServerSummary.month === month) {
      const totalSpentCop = currentServerSummary.buckets.reduce(
        (sum, bucket) => sum + bucket.spentCop,
        0,
      );
      return {
        month: currentServerSummary.month,
        incomeCop: currentServerSummary.incomeCop,
        buckets: currentServerSummary.buckets,
        totalSpentCop,
        balanceCop: currentServerSummary.incomeCop - totalSpentCop,
      };
    }
    return localSummary;
  }, [pendingCount, currentServerSummary, month, localSummary]);

  const handleApiError = useCallback(
    async (error: unknown, fallback: string) => {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
        return;
      }
      setLastError(error instanceof Error ? error.message : fallback);
    },
    [signOut],
  );

  const fetchMonth = useCallback(async () => {
    if (!token || isDemo) return;
    const [list, summaryResponse] = await Promise.all([
      api.listTransactions(token, month),
      api.summary(token, month),
    ]);
    setTransactions((prev) => mergeServerTransactions(prev, list.items, month));
    setServerSummary({ scope, summary: summaryResponse });
  }, [token, isDemo, month, scope]);

  const refresh = useCallback(async () => {
    if (!token || isDemo) {
      setLastError(null);
      return;
    }
    setIsRefreshing(true);
    setLastError(null);
    try {
      await fetchMonth();
    } catch (error) {
      await handleApiError(error, 'No pudimos actualizar tus finanzas.');
    } finally {
      setIsRefreshing(false);
    }
  }, [token, isDemo, fetchMonth, handleApiError]);

  const syncPending = useCallback(async (): Promise<{ synced: number }> => {
    if (!token || isDemo) return { synced: 0 };
    const batch = txRef.current.filter((transaction) => transaction.pending);
    if (!batch.length) return { synced: 0 };
    if (isOffline) {
      setLastError('Sin conexión. Los cambios se sincronizarán cuando vuelvas a estar en línea.');
      return { synced: 0 };
    }
    setIsSyncing(true);
    setLastError(null);
    try {
      await api.syncTransactions(token, batch);
      const syncedIds = new Set(batch.map((transaction) => transaction.clientId));
      setTransactions((prev) =>
        prev.map((transaction) =>
          syncedIds.has(transaction.clientId) ? { ...transaction, pending: false } : transaction,
        ),
      );
      await fetchMonth();
      return { synced: batch.length };
    } catch (error) {
      await handleApiError(error, 'No pudimos sincronizar los movimientos pendientes.');
      return { synced: 0 };
    } finally {
      setIsSyncing(false);
    }
  }, [token, isDemo, isOffline, fetchMonth, handleApiError]);

  useEffect(() => {
    if (!isLoaded || !token || isDemo || isOffline) return;
    // Se aplaza para no disparar setState de forma síncrona dentro del efecto.
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [isLoaded, token, isDemo, isOffline, month, refresh]);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      return;
    }
    if (
      wasOffline.current &&
      isLoaded &&
      token &&
      !isDemo &&
      txRef.current.some((transaction) => transaction.pending)
    ) {
      wasOffline.current = false;
      void syncPending();
    }
  }, [isOffline, isLoaded, token, isDemo, syncPending]);

  const addTransaction = useCallback(
    async (input: AddTransactionInput): Promise<Transaction> => {
      const transaction: Transaction = {
        clientId: Crypto.randomUUID(),
        type: input.type,
        ...(input.bucket ? { bucket: input.bucket } : {}),
        amountCop: input.amountCop,
        description: input.description.trim(),
        date: input.date ?? todayAtNoonIso(),
        pending: true,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [transaction, ...prev]);

      if (token && !isDemo && !isOffline) {
        try {
          await api.createTransaction(token, transaction);
          setTransactions((prev) =>
            prev.map((item) =>
              item.clientId === transaction.clientId ? { ...item, pending: false } : item,
            ),
          );
          setLastError(null);
          void fetchMonth();
        } catch (error) {
          await handleApiError(
            error,
            'El movimiento quedó guardado en el dispositivo y se sincronizará más tarde.',
          );
        }
      }
      return transaction;
    },
    [token, isDemo, isOffline, fetchMonth, handleApiError],
  );

  const loadSampleData = useCallback(async () => {
    const samples = buildSampleTransactions(month, true);
    setTransactions((prev) => [...samples, ...prev]);
    if (token && !isDemo && !isOffline) {
      try {
        await api.syncTransactions(token, samples);
        const sampleIds = new Set(samples.map((transaction) => transaction.clientId));
        setTransactions((prev) =>
          prev.map((transaction) =>
            sampleIds.has(transaction.clientId)
              ? { ...transaction, pending: false }
              : transaction,
          ),
        );
        await fetchMonth();
      } catch (error) {
        await handleApiError(
          error,
          'Los datos de ejemplo se guardaron localmente y se sincronizarán luego.',
        );
      }
    }
  }, [month, token, isDemo, isOffline, fetchMonth, handleApiError]);

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    setGoals((prev) => [{ ...goal, id: Crypto.randomUUID() }, ...prev]);
  }, []);

  const contributeToGoal = useCallback((id: string, amountCop: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              savedCop: Math.max(0, Math.min(goal.targetCop, goal.savedCop + amountCop)),
            }
          : goal,
      ),
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      goals,
      summary,
      month,
      isLoaded,
      isRefreshing,
      isSyncing,
      isOffline,
      pendingCount,
      lastError,
      setMonth,
      setLastError,
      refresh,
      syncPending,
      addTransaction,
      loadSampleData,
      addGoal,
      contributeToGoal,
      deleteGoal,
    }),
    [
      transactions,
      goals,
      summary,
      month,
      isLoaded,
      isRefreshing,
      isSyncing,
      isOffline,
      pendingCount,
      lastError,
      refresh,
      syncPending,
      addTransaction,
      loadSampleData,
      addGoal,
      contributeToGoal,
      deleteGoal,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance debe usarse dentro de <FinanceProvider>');
  return context;
}

function mapApiTransaction(transaction: ApiTransaction): Transaction {
  return {
    clientId: transaction.clientId,
    type: transaction.type,
    ...(transaction.bucket ? { bucket: transaction.bucket } : {}),
    amountCop: transaction.amountCop,
    description: transaction.description,
    date: transaction.date,
    pending: false,
    createdAt: transaction.createdAt ?? new Date().toISOString(),
  };
}

/** El servidor manda para los movimientos ya sincronizados; los pendientes se conservan. */
function mergeServerTransactions(
  previous: Transaction[],
  serverTransactions: ApiTransaction[],
  month: string,
): Transaction[] {
  const fromServer = serverTransactions.map(mapApiTransaction);
  const serverIds = new Set(fromServer.map((transaction) => transaction.clientId));
  const localOnly = previous.filter(
    (transaction) =>
      transaction.pending ||
      transaction.date.slice(0, 7) !== month ||
      !serverIds.has(transaction.clientId),
  );
  const merged = new Map<string, Transaction>();
  for (const transaction of localOnly) merged.set(transaction.clientId, transaction);
  for (const transaction of fromServer) merged.set(transaction.clientId, transaction);
  return Array.from(merged.values()).sort((a, b) => b.date.localeCompare(a.date));
}
