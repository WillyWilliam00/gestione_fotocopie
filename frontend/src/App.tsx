import AppLayout from "@/components/AppLayout";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import RegistraCopie from "./components/RegistraCopie";
import GestioneDocenti from "./components/GestioneDocenti";
import GestioneUtenze from "./components/GestioneUtenze";
import VisualizzaRegistrazioni from "./components/VisualizzaRegistrazioni";
import ProfiloUtente from "./components/ProfiloUtente";
import Login from "./components/Login";
import Register from "./components/Register";
import LandingPage from "./components/LandingPage";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";
import { useAuthStore } from "./store/auth-store.js";

export function App() {
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // QueryClient creato una sola volta per l'intera vita del componente
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          staleTime: 2 * 60 * 1000,
          gcTime: 5 * 60 * 1000,
        },
      },
    });
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClientRef.current}>
        <BrowserRouter>
          <Routes>
            {/* Route pubbliche */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Route protette con AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/registra-copie" element={<RegistraCopie />} />
              <Route
                path="/dashboard-insegnanti"
                element={<Navigate to="/gestione-docenti" replace />}
              />
              <Route
                path="/gestione-docenti"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GestioneDocenti />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestione-utenze"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GestioneUtenze />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visualizza-registrazioni"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <VisualizzaRegistrazioni />
                  </ProtectedRoute>
                }
              />
              <Route path="/profilo" element={<ProfiloUtente />} />
            </Route>

            {/* Route catch-all per 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
