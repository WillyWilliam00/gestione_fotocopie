import AppLayout from "@/components/AppLayout";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import RegistraCopie from "./components/RegistraCopie";
import GestioneDocenti from "./components/GestioneDocenti";
import GestioneUtenze from "./components/GestioneUtenze";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthInitialization } from "./hooks/use-auth-initialization.js";

export function App() {
  // Inizializza l'autenticazione all'avvio (refresh token se scaduto)
  useAuthInitialization();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        // Dati considerati "freschi" per 2 minuti: niente refetch automatico in quel periodo
        staleTime: 2 * 60 * 1000, // 2 minuti (in ms)
        // Cache tenuta in memoria per 5 minuti dopo che nessun componente la usa
        gcTime: 5 * 60 * 1000, // 5 minuti (in ms), ex cacheTime in v4
      },
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
              {/* Route pubbliche */}
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
                <Route path="/" element={<RegistraCopie />} />
                <Route
                  path="/dashboard-insegnanti"
                  element={<Navigate to="/gestione-docenti" replace />}
                />
                <Route path="/gestione-docenti" element={
                  <ProtectedRoute requiredRole="admin">
                    <GestioneDocenti />
                  </ProtectedRoute>
                } />
                <Route
                  path="/gestione-utenze"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <GestioneUtenze />
                    </ProtectedRoute>
                  }
                />
              </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
