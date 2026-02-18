import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store.js";
import { isTokenExpired } from "../lib/jwt-utils.js";
import { refresh } from "../lib/auth-api.js";

/**
 * Custom hook per gestire l'inizializzazione dell'autenticazione all'avvio
 * 
 * Spiegazione:
 * - Il persist middleware ripristina automaticamente lo stato da localStorage
 * - I dati utente sono IMMEDIATAMENTE disponibili nello store (nessuna chiamata API)
 * - Verifichiamo se il token è scaduto
 * - Se scaduto e abbiamo refresh token valido, chiamiamo refresh in background
 * - Se refresh fallisce, lo store viene pulito automaticamente
 * 
 * Pattern moderno (2026): Custom hook invece di componente wrapper
 * Vantaggi:
 * - Più idiomatico per React (hooks per side effects)
 * - Nessun wrapper component inutile nel DOM
 * - Più flessibile (puoi restituire stato se necessario)
 * 
 * Uso:
 * ```tsx
 * function App() {
 *   useAuthInitialization(); // Chiamata diretta
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export function useAuthInitialization() {
  const { token, refreshToken } = useAuthStore();

  useEffect(() => {
    /**
     * Inizializza l'autenticazione all'avvio dell'app
     * 
     * Flusso:
     * 1. Se non ci sono token salvati → esci (utente non autenticato)
     * 2. Se il token è ancora valido → esci (tutto ok)
     * 3. Se il token è scaduto → prova refresh
     * 4. Se refresh fallisce → logout automatico
     */
    const initializeAuth = async () => {
      // Se non c'è token, non fare nulla
      if (!token || !refreshToken) {
        return;
      }

      // Se il token è ancora valido, non serve fare refresh
      if (!isTokenExpired(token)) {
        return;
      }

      // Token scaduto, prova refresh in background
      try {
        await refresh(refreshToken);
      } catch (error) {
        // Refresh fallito, logout automatico (lo store viene pulito)
        console.error('Refresh token fallito:', error);
        useAuthStore.getState().logout();
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Esegui solo al mount iniziale
  // Nota: non includiamo token/refreshToken nelle dipendenze perché
  // vogliamo eseguire solo una volta all'avvio, non ogni volta che cambiano
}
