import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResponse, RefreshTokenResponse, JwtPayload } from '../../../shared/types.js';
import { decodeJWT } from '../lib/jwt-utils.js';

/**
 * Store Zustand per gestione stato autenticazione
 * 
 * Spiegazione Zustand:
 * - Zustand è una libreria di state management più leggera di Redux
 * - Il middleware persist salva automaticamente lo stato in localStorage
 * - All'avvio dell'app, lo stato viene ripristinato da localStorage
 * - Pattern create<T>()() con doppie parentesi per TypeScript corretto
 * - Salvare sia dati utente che JWT payload permette accesso rapido senza decodificare ogni volta
 */

interface AuthState {
  // Token di autenticazione
  token: string | null;
  refreshToken: string | null;
  
  // Dati utente completi (da LoginResponse)
  utente: {
    id: string;
    email: string | null;
    username: string | null;
    ruolo: 'admin' | 'collaboratore';
  } | null;
  
  // JWT payload decodificato (per accesso rapido a userId, ruolo, istitutoId)
  jwtPayload: JwtPayload | null;
  
  // Computed: verifica se l'utente è autenticato
  isAuthenticated: boolean;
  
  // Azioni
  login: (response: LoginResponse) => void;
  logout: () => void;
  refresh: (response: RefreshTokenResponse) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setUser: (utente: AuthState['utente']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Stato iniziale
      token: null,
      refreshToken: null,
      utente: null,
      jwtPayload: null,
      isAuthenticated: false,

      /**
       * Login: salva token, refreshToken, dati utente e decodifica JWT payload
       * 
       * Spiegazione:
       * - Viene chiamato dopo un login riuscito
       * - Salva tutti i dati necessari nello store
       * - Decodifica il JWT per estrarre il payload (userId, ruolo, istitutoId)
       * - I dati vengono automaticamente persistiti in localStorage grazie al middleware persist
       */
      login: (response: LoginResponse) => {
        const jwtPayload = decodeJWT(response.token);
        
        set({
          token: response.token,
          refreshToken: response.refreshToken,
          utente: response.utente,
          jwtPayload,
          isAuthenticated: true,
        });
      },

      /**
       * Logout: pulisce tutto lo stato
       * 
       * Spiegazione:
       * - Viene chiamato quando l'utente fa logout
       * - Pulisce tutti i dati dallo store
       * - I dati vengono automaticamente rimossi da localStorage grazie al middleware persist
       */
      logout: () => {
        set({
          token: null,
          refreshToken: null,
          utente: null,
          jwtPayload: null,
          isAuthenticated: false,
        });
      },

      /**
       * Refresh: aggiorna token e refreshToken dopo un refresh riuscito
       * 
       * Spiegazione:
       * - Viene chiamato quando l'access token viene rinnovato
       * - Aggiorna solo i token (non i dati utente che rimangono invariati)
       * - Decodifica il nuovo JWT per aggiornare il payload
       */
      refresh: (response: RefreshTokenResponse) => {
        const jwtPayload = decodeJWT(response.token);
        
        set({
          token: response.token,
          refreshToken: response.refreshToken || get().refreshToken,
          jwtPayload,
          // Manteniamo utente e isAuthenticated invariati
        });
      },

      /**
       * setTokens: aggiorna solo i token (utile per refresh automatico)
       */
      setTokens: (token: string, refreshToken: string) => {
        const jwtPayload = decodeJWT(token);
        
        set({
          token,
          refreshToken,
          jwtPayload,
        });
      },

      /**
       * setUser: aggiorna solo i dati utente (raro, ma utile se necessario)
       */
      setUser: (utente: AuthState['utente']) => {
        set({ utente });
      },
    }),
    {
      name: 'auth-storage', // Chiave in localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo questi campi vengono persistiti
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        utente: state.utente,
        jwtPayload: state.jwtPayload,
      }),
      // Quando i dati vengono ripristinati da localStorage, calcoliamo isAuthenticated
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token && !!state.utente;
        }
      },
    }
  )
);
