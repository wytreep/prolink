import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type {
  ApiSummary,
  ApiSyncResult,
  ApiTransaction,
  ApiTransactionList,
  AuthResponse,
  Transaction,
} from '@/types';

/**
 * En desarrollo, Metro conoce la IP de la maquina que sirve la app. Usarla
 * evita tener que configurar la IP a mano en el celular. EXPO_PUBLIC_API_URL
 * siempre tiene prioridad (util para un backend desplegado).
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:4000/api/v1`;
  }
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api/v1'
    : 'http://localhost:4000/api/v1';
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 12000);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as
      | (T & { error?: string; details?: { path: string; message: string }[] })
      | null;

    if (!response.ok) {
      throw new ApiError(
        payload?.error ?? 'No pudimos completar la solicitud.',
        response.status,
        payload?.details,
      );
    }
    if (!payload) throw new ApiError('La respuesta del servidor llegó vacía.', response.status);
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('El servidor tardó demasiado en responder.', 0);
    }
    throw new ApiError(
      'No hay conexión con el servidor. Revisa tu red o usa el modo demo.',
      0,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  register(name: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  },

  listTransactions(token: string, month: string): Promise<ApiTransactionList> {
    return request<ApiTransactionList>(`/finance/transactions?month=${encodeURIComponent(month)}`, {
      token,
    });
  },

  summary(token: string, month: string): Promise<ApiSummary> {
    return request<ApiSummary>(`/finance/summary?month=${encodeURIComponent(month)}`, { token });
  },

  createTransaction(token: string, tx: Transaction): Promise<ApiTransaction> {
    return request<ApiTransaction>('/finance/transactions', {
      method: 'POST',
      token,
      body: toApiPayload(tx),
    });
  },

  syncTransactions(token: string, transactions: Transaction[]): Promise<ApiSyncResult> {
    return request<ApiSyncResult>('/finance/transactions/sync', {
      method: 'POST',
      token,
      body: { transactions: transactions.map(toApiPayload) },
    });
  },

  health(): Promise<{ status: string }> {
    return request<{ status: string }>('/health', { timeoutMs: 5000 });
  },
};

function toApiPayload(tx: Transaction) {
  return {
    clientId: tx.clientId,
    type: tx.type,
    ...(tx.bucket ? { bucket: tx.bucket } : {}),
    amountCop: tx.amountCop,
    description: tx.description,
    date: tx.date,
  };
}
