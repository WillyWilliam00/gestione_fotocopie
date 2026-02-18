# Todo – CopyTrack

Lista di attività da completare per il progetto. Usa questo file come roadmap.

---




- [ ] **Inserire filtri (input) in tabelle legati al backend, non in client**  
  Aggiungere campi di filtro/ricerca nelle tabelle che inviano i criteri al backend (query params o body). Il filtraggio deve avvenire lato server (API) e non sul dataset già caricato in client, così da supportare grandi volumi di dati e paginazione coerente.

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

- [ ] **Gestire ErrorBoundary localmente nelle tabelle**  
  Implementare ErrorBoundary specifici per ogni tabella (DataTable) per gestire errori di caricamento dati in modo isolato, senza bloccare l'intera applicazione.

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

- [ ] **Controllare CRUD in tabelle**  
  Verificare e testare tutte le operazioni CRUD nelle tabelle esistenti (docenti, utenti) per assicurarsi che funzionino correttamente e gestiscano gli errori in modo appropriato.

- [ ] **Implementare pagina tabella registrazioni con CRUD**  
  Creare una pagina dedicata per la gestione delle registrazioni copie con:
  - Tabella impaginata delle registrazioni
  - Operazioni CRUD complete (Create, Read, Update, Delete)
  - Filtri e ricerca avanzata

- [ ] **Implementare reset docenti con possibilità di cambiare i limiti**  
  Nella funzionalità di reset docenti, aggiungere la possibilità di modificare i limiti di copie per ogni docente durante l'operazione di reset.

---

## UI/UX

- [ ] **Inserire landing page**  
  Creare una pagina di benvenuto/landing page per l'applicazione con informazioni sul sistema e accesso rapido alle funzionalità principali.

---

## Autenticazione e sicurezza

- [ ] **Inserire recupero password per collaboratori**  
  Implementare funzionalità di recupero password per i collaboratori:
  - Form di richiesta reset password (email)
  - Invio email con link di reset
  - Pagina di reset password con token
  - Validazione token e aggiornamento password

---

## Studio / comprensione

- [ ] **Comprendere a pieno: ErrorBoundary, QueryClient, App.tsx (righe 19–74)**  
  - **ErrorBoundary**: quando intercetta errori, come si usa `componentDidCatch` / `getDerivedStateFromError`, differenza tra locale e globale, quando mostrare fallback.  
  - **QueryClient**: dove vive l’istanza, come tiene la cache in RAM (oggetti JS nello heap), `staleTime` / `gcTime`, invalidazione.  


---

## Ordine suggerito

1. Fix login infinito.
2. GET impaginate + hook `useDocenti` (poi `useUtenti`).
3. Allineare `isLoading` / `isFetching` negli hook e in UI.
4. ErrorBoundary e Suspense (in parallelo o subito dopo).
5. Completare CRUD docenti e CRUD utenti usando gli hook e le GET impaginate.

---

*Ultimo aggiornamento: febbraio 2026*
