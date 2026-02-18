# Todo – CopyTrack

Lista di attività da completare per il progetto. Usa questo file come roadmap.

---

## Bug e fix

- [ ] **Login: caricamento infinito quando riprovo**  
  Indagare perché, dopo un tentativo di login fallito, al riprovare il form resta in stato "Accesso in corso..." (carica all'infinito). Verificare stato di submit, redirect e interceptor di refresh.

---

## API e dati

- [ ] **GET impaginate**  
  Implementare rotte GET impaginate lato backend e consumarle con `useInfiniteQuery` (TanStack Query).  
  Esempio target per i docenti:

  ```ts
  // hooks/useDocenti.ts
  import { keepPreviousData } from '@tanstack/react-query';

  const query = useInfiniteQuery({
    queryKey: ['docenti', { search }],
    queryFn: ({ pageParam = 1 }) => fetchDocenti(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    placeholderData: keepPreviousData, // TanStack Query v5: import da '@tanstack/react-query'
  });
  ```

  Replicare lo stesso pattern per **docenti** e **utenti**. Backend: risposta con `{ rows, nextPage }` (o `hasMore`).

- [ ] **Gestione isLoading e isFetching**  
  Distinguere correttamente `isLoading` (primo caricamento) da `isFetching` (refetch/paginazione) negli hook e nell’UI (es. skeleton vs spinner).

---

## Architettura frontend

- [ ] **Hook per macro categoria**  
  Creare un hook dedicato per ogni macro area:
  - `useDocenti` (lista impaginata, CRUD)
  - `useUtenti` (lista impaginata, CRUD)
  - (altri in base alle feature)

  Ogni hook espone: dati, `isLoading`/`isFetching`, `fetchNextPage`, `hasNextPage`, mutations (create, update, delete) e invalidazione cache.

- [ ] **ErrorBoundary locale e globale con Suspense**  
  - ErrorBoundary **globale** in root (es. in `App.tsx`) per errori non recuperabili.
  - ErrorBoundary **locali** per sezioni (es. lista docenti, lista utenti).
  - Integrare **Suspense** dove si caricano dati (lazy route o componenti che usano i nuovi hook) con fallback di caricamento.

---

## CRUD

- [ ] **CRUD docenti**  
  Completare flusso CRUD docenti:
  - Lista impaginata (con ricerca)
  - Create (form + chiamata API)
  - Update (form + chiamata API)
  - Delete (con conferma e invalidazione cache)

- [ ] **CRUD utenti**  
  Completare flusso CRUD utenti (solo admin):
  - Lista impaginata (con ricerca)
  - Create (form + chiamata API)
  - Update (form + chiamata API)
  - Delete (con conferma e invalidazione cache)

---

## Studio / comprensione

- [ ] **Comprendere a pieno: ErrorBoundary, QueryClient, App.tsx (righe 19–74)**  
  - **ErrorBoundary**: quando intercetta errori, come si usa `componentDidCatch` / `getDerivedStateFromError`, differenza tra locale e globale, quando mostrare fallback.  
  - **QueryClient**: dove vive l’istanza, come tiene la cache in RAM (oggetti JS nello heap), `staleTime` / `gcTime`, invalidazione.  
  - **App.tsx (19–74)**: ruolo di `PublicRoute` (redirect se già loggato), ruolo di `AuthInitializer` (refresh token al mount, logout se refresh fallisce), ordine dei componenti nel tree.

---

## Ordine suggerito

1. Fix login infinito.
2. GET impaginate + hook `useDocenti` (poi `useUtenti`).
3. Allineare `isLoading` / `isFetching` negli hook e in UI.
4. ErrorBoundary e Suspense (in parallelo o subito dopo).
5. Completare CRUD docenti e CRUD utenti usando gli hook e le GET impaginate.

---

*Ultimo aggiornamento: febbraio 2025*
