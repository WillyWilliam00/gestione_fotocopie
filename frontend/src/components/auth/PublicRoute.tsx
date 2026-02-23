import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

/**
 * Componente per gestire redirect se già autenticato su route pubbliche
 * 
 * Spiegazione:
 * - Impedisce agli utenti già autenticati di accedere a login/register
 * - Se l'utente è autenticato e visita /login o /register, viene reindirizzato alla home
 * - Migliora l'UX evitando confusione quando si è già loggati
 */
export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Se già autenticato e su login/register, redirect a home
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/registra-copie" replace />;
  }

  return <>{children}</>;
}
