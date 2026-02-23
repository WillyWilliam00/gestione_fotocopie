import { Link } from "react-router-dom";
import { CameraIcon, HomeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/auth-store";

/**
 * Componente 404 Not Found
 * 
 * Spiegazione:
 * - Mostra una pagina di errore quando l'utente accede a una route inesistente
 * - Design coerente con Login/Register per mantenere coerenza visiva
 * - Offre link per tornare alla home o al login a seconda dello stato di autenticazione
 */
export default function NotFound() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary rounded-lg p-6 w-full max-w-xl text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary p-2 mx-auto">
          <HugeiconsIcon icon={CameraIcon} strokeWidth={2} className="text-secondary w-12 h-12" />
        </div>
        <h1 className="text-6xl font-bold text-primary mt-4">404</h1>
        <h2 className="text-2xl font-semibold text-primary mt-2">Pagina non trovata</h2>
        <p className="text-muted-foreground mt-4 mb-6">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link to="/registra-copie">
                <Button className="w-full sm:w-auto rounded-none">
                  <HugeiconsIcon icon={HomeIcon} strokeWidth={2} className="w-4 h-4 mr-2" />
                  Torna alla Home
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto rounded-none">
                  <HugeiconsIcon icon={HomeIcon} strokeWidth={2} className="w-4 h-4 mr-2" />
                  Torna alla Landing
                </Button>
              </Link>
              <Link to="/login">
                <Button className="w-full sm:w-auto rounded-none">
                  Accedi
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
