import { Component, type ReactNode } from 'react';

/**
 * ErrorBoundary per gestione errori non gestiti
 * 
 * Spiegazione:
 * - Cattura errori JavaScript in qualsiasi punto dell'albero dei componenti
 * - Utile per errori di rendering, errori nei lifecycle methods, errori nei costruttori
 * - Funziona insieme a Suspense per gestire errori durante data fetching
 * - Pattern standard React per gestione errori globali
 * 
 * Nota: ErrorBoundary NON cattura errori in:
 * - Event handlers (usare try/catch)
 * - Codice asincrono (usare try/catch)
 * - Server-side rendering
 * - Errori lanciati nell'ErrorBoundary stesso
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Aggiorna lo stato per mostrare il fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Puoi loggare l'errore a un servizio di reporting
    console.error('ErrorBoundary catturato:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Renderizza il fallback UI personalizzato o quello di default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-xl text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ops! Qualcosa è andato storto</h1>
            <p className="text-muted-foreground mb-4">
              Si è verificato un errore imprevisto. Per favore, ricarica la pagina.
            </p>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Dettagli errore
                </summary>
                <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-secondary rounded hover:opacity-90"
            >
              Ricarica pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
