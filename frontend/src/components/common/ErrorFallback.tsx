export interface ErrorFallbackProps {
  onRetry: () => void;
}

export default function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h2 className="text-lg font-semibold text-destructive mb-2">
        Errore nel caricamento dei dati
      </h2>
      <p className="text-muted-foreground text-sm mb-4">
        Riprova o ricarica la pagina.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium"
      >
        Riprova
      </button>
    </div>
  );
}
