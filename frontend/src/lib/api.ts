import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth-store.js';
import type { AxiosResponse } from 'axios';
import type { RefreshTokenResponse } from '../../../shared/types.js';

/**
 * Istanza Axios configurata con interceptors per gestione token e refresh automatico
 * 
 * Spiegazione Axios:
 * - Axios è un client HTTP che semplifica le chiamate API rispetto a fetch
 * - Gli interceptors permettono di modificare richieste/risposte automaticamente
 * - Request interceptor: aggiunge token a ogni richiesta senza doverlo specificare manualmente
 * - Response interceptor: intercetta errori 401 e gestisce refresh token automaticamente
 */

// Base URL del backend (può essere sovrascritto da variabile d'ambiente)
// IMPORTANTE: Il frontend Vite è su porta 3000, quindi il backend deve essere su un'altra porta
// Se il backend è su porta 3000, cambia la porta del backend a 3001 o configura VITE_API_BASE_URL
// Esempio: crea un file .env.local nel frontend con VITE_API_BASE_URL=http://localhost:3001/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Creiamo l'istanza Axios
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag per evitare loop infiniti durante il refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Processa la coda di richieste fallite dopo il refresh
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Request Interceptor: aggiunge il token di autenticazione a ogni richiesta
 * 
 * Spiegazione:
 * - Viene eseguito PRIMA di ogni richiesta HTTP
 * - Recupera il token dallo store Zustand
 * - Aggiunge l'header Authorization se il token è presente
 * - Non serve specificare il token manualmente in ogni chiamata API
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

/**
 * Response Interceptor: gestisce errori 401 e refresh token automatico
 * 
 * Spiegazione:
 * - Viene eseguito DOPO ogni risposta HTTP
 * - Se riceve 401 (token scaduto), tenta automaticamente il refresh
 * - Se refresh ha successo, ripete la richiesta originale con il nuovo token
 * - Se refresh fallisce, fa logout e redirect a login
 * - Evita che l'utente debba rifare login quando l'access token scade (15 minuti)
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Se l'errore non è 401 o la richiesta è già stata ritentata, rifiuta
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Richieste senza token (es. login, register): il 401 è "credenziali sbagliate",
    // non "token scaduto". Reject subito senza refresh né coda, così il catch nel form viene chiamato.
    const authHeader = originalRequest.headers?.Authorization;
    const hasAuth = typeof authHeader === 'string' && authHeader.startsWith('Bearer ');
    if (!hasAuth) {
      return Promise.reject(error);
    }

    // Controlla se l'errore indica che l'utente è stato eliminato
    // In questo caso, logout immediato senza tentare refresh
    const errorMessage = (error.response?.data as { error?: string })?.error || '';
    const isUserDeleted = errorMessage.includes('Utente non trovato') || 
                          errorMessage.includes('account eliminato') ||
                          errorMessage.includes('non trovato');

    if (isUserDeleted) {
      // Utente eliminato: logout immediato e redirect
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Se stiamo già facendo refresh, mettiamo la richiesta in coda
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      // Nessun refresh token disponibile, logout e non tentare refresh
      isRefreshing = false;
      useAuthStore.getState().logout();
      processQueue(error, null);
      return Promise.reject(error);
    }

    try {
      // Chiama l'endpoint di refresh
      const response = await axios.post<RefreshTokenResponse>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Aggiorna i token nello store
      if(newRefreshToken) {
        useAuthStore.getState().setTokens(newToken, newRefreshToken);
      } else {
        useAuthStore.getState().setTokens(newToken, refreshToken);
      }

      // Processa la coda con successo
      processQueue(null, newToken);

      // Ripeti la richiesta originale con il nuovo token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh fallito, logout e redirect
      // Questo può succedere se:
      // - Il refresh token è scaduto o revocato
      // - L'utente è stato eliminato dal database
      // - Problemi di connessione
      processQueue(refreshError as AxiosError, null);
      useAuthStore.getState().logout();
      
      // Redirect a login se siamo in un contesto browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
