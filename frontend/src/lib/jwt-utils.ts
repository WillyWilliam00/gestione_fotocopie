import type { JwtPayload } from '../../../shared/types.js';

/**
 * Decodifica un JWT senza verificare la firma (solo lettura payload)
 * 
 * Spiegazione:
 * - Non serve verificare la firma nel frontend (il backend lo fa già)
 * - Decodificare il payload permette di accedere a userId, ruolo, istitutoId senza chiamare API
 * - Utile per protezione route basata su ruolo e per mostrare info utente
 * 
 * @param token - Il JWT token da decodificare
 * @returns Il payload decodificato o null se il token è malformato
 */
export function decodeJWT(token: string): JwtPayload | null {
  try {
    // JWT formato: header.payload.signature
    // Prendiamo solo la parte payload (indice 1)
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    // Convertiamo base64url in base64 standard
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decodifichiamo base64 e parsiamo JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error('Errore nella decodifica JWT:', error);
    return null;
  }
}

/**
 * Verifica se un JWT è scaduto controllando il claim 'exp'
 * 
 * Spiegazione:
 * - Il claim 'exp' contiene il timestamp Unix (in secondi) di scadenza
 * - Confrontiamo con il timestamp corrente
 * - Utile per evitare chiamate API inutili se il token è ancora valido
 * 
 * @param token - Il JWT token da verificare
 * @returns true se il token è scaduto, false altrimenti
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) {
    return true; // Token malformato, consideriamo scaduto
  }

  // exp è un campo standard JWT aggiunto automaticamente da jsonwebtoken
  // Se non c'è exp nel payload, potrebbe essere un token senza scadenza (raro)
  // Per sicurezza, consideriamo scaduto se non c'è exp
  const exp = (payload as JwtPayload & { exp?: number }).exp;
  if (!exp) {
    return true;
  }

  // exp è in secondi, Date.now() è in millisecondi
  const currentTime = Math.floor(Date.now() / 1000);
  return exp < currentTime;
}
