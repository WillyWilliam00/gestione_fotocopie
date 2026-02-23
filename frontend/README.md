## ScriptaScuola Frontend

Il frontend di **ScriptaScuola** è una **single page application** in **React + TypeScript** che fornisce l’interfaccia per:
- registrare le fotocopie effettuate,
- gestire i docenti e i relativi limiti,
- gestire le utenze (admin/collaboratori),
- eseguire login e registrazione iniziale dell’istituto.

È sviluppato con **Vite** e utilizza **Tailwind CSS**, componenti UI (shadcn, Base UI) e **TanStack Query** per la gestione dei dati lato client.

### Indice

- [Stack frontend](#stack-frontend)
- [Struttura principale](#struttura-principale)
- [Integrazione con il backend ScriptaScuola](#integrazione-con-il-backend-scriptascuola)
- [Setup & avvio](#setup--avvio)
  - [Prerequisiti](#prerequisiti)
  - [Installazione dipendenze](#installazione-dipendenze)
  - [Avvio in sviluppo](#avvio-in-sviluppo)
- [Build di produzione](#build-di-produzione)
- [Note di design](#note-di-design)

### Stack frontend

- React 19 + TypeScript
- Vite
- React Router (`react-router-dom`) per il routing client‑side
- Tailwind CSS, shadcn/UI, Base UI per il design dei componenti
- TanStack Query / Form / Table per:
  - gestione asincrona dei dati (`QueryClient`),
  - validazione e gestione dei form (via Zod e adapter TanStack),
  - tabelle e viste tabellari.
- Integrazione con le API backend di ScriptaScuola tramite HTTP client (es. Axios).

### Struttura principale

- `src/main.tsx`
  - Monta l’app React nel DOM con `StrictMode`.
  - Importa gli stili globali (`index.css`).
  - Renderizza `App`.

- `src/App.tsx`
  - Configura:
    - `QueryClientProvider` di TanStack Query.
    - `BrowserRouter` e le varie route principali dell’app.
  - Routing:
    - `/` → **landing page** (`LandingPage`).
    - `/login` → pagina di login.
    - `/register` → pagina di registrazione/setup iniziale.
    - Rotte protette racchiuse in `AppLayout`:
      - `/registra-copie` → vista registrazione copie (`RegistraCopie`).
      - `/gestione-docenti` → gestione docenti e limiti (`GestioneDocenti`).
      - `/gestione-utenze` → gestione utenze (admin/collaboratori) (`GestioneUtenze`).
      - `/visualizza-registrazioni` → visualizzazione registrazioni copie (`VisualizzaRegistrazioni`).
      - `/profilo` → profilo utente (`ProfiloUtente`).
    - Route catch-all `*` → pagina 404 (`NotFound`).

- Componenti principali (indicativi):
  - `components/AppLayout.tsx`: layout principale con navigazione, header, ecc.
  - `components/LandingPage.tsx`, `components/landing/*`: landing page con Hero, Features, FAQ, CTA.
  - `components/RegistraCopie.tsx`: form e flusso per registrare nuove fotocopie (selezione docente, numero copie, note, ecc.).
  - `components/GestioneDocenti.tsx`: lista docenti con modali (NuovoDocenteModal, EditDocenteModal, ViewDocenteModal) e dialoghi (EliminaDocenteDialog, EliminaTuttiDocentiDialog, ResetConteggioDialog).
  - `components/ImportDocentiDialog.tsx`: dialog per importare docenti da file Excel con anteprima dei dati.
  - `components/GestioneUtenze.tsx`: lista utenti con modali (NuovoUtenteModal, EditUtenteModal, ViewUtenteModal) e dialoghi (EliminaUtenteDialog, DeleteUtenteAlertDialog).
  - `components/VisualizzaRegistrazioni.tsx`: visualizzazione registrazioni copie con tabella e filtri.
  - `components/ProfiloUtente.tsx`: profilo utente autenticato.
  - `components/NotFound.tsx`: pagina 404 per route non trovate.
  - `components/Login.tsx` e `components/Register.tsx`: flussi di autenticazione e setup istituto.

> Nota: i nomi esatti e la struttura interna dei componenti possono evolvere, ma l’idea principale è mantenere una separazione chiara tra aree funzionali (copie, docenti, utenze, auth).

### Integrazione con il backend ScriptaScuola

- Il frontend comunica con le API esposte dal backend:
  - `/api/auth` per login, setup scuola, refresh token, logout.
  - `/api/docenti` per elenco/gestione docenti, importazione bulk da Excel, eliminazione multipla.
  - `/api/utenti` per elenco/gestione utenti (admin).
  - `/api/registrazioni-copie` per creare/listare/eliminare registrazioni di copie, eliminazione multipla.
  - `/api/istituti` per gestione istituto (es. eliminazione).
- Funzionalità aggiuntive implementate:
  - Importazione bulk docenti da Excel (`POST /api/docenti/bulk-import`) con anteprima dati.
  - Eliminazione di tutti i docenti (`DELETE /api/docenti/delete-all`).
  - Eliminazione di tutte le registrazioni copie (`DELETE /api/registrazioni-copie/delete-all`).
- Le chiamate HTTP possono essere implementate con **Axios** o `fetch`, idealmente incapsulate in servizi dedicati (es. `api/docenti`, `api/utenti`, ecc.).
- TanStack Query si occupa di:
  - caching delle risposte,
  - refetch automatico quando necessario,
  - gestione di loading/error state.

### Setup & avvio

#### Prerequisiti

- Node.js (versione LTS recente)
- Backend di ScriptaScuola in esecuzione (vedi `backend/README.md`)

#### Installazione dipendenze

Se hai già eseguito `npm install` nella root del monorepo, le dipendenze del frontend saranno già installate.
In alternativa, puoi installarle esplicitamente:

```bash
cd frontend
npm install
```

#### Avvio in sviluppo

```bash
cd frontend
npm run dev
```

Per impostazione predefinita Vite avvierà l’app su `http://localhost:5173` (o porta configurata).

### Build di produzione

Per creare una build ottimizzata:

```bash
cd frontend
npm run build
```

Puoi poi usare `npm run preview` per un’anteprima locale della build.

### Note di design

- L’interfaccia è pensata per essere **semplice e veloce da usare in segreteria scolastica**:
  - accesso rapido alla registrazione copie,
  - navigazione chiara tra gestione docenti e utenze,
  - feedback immediato sugli errori (es. limiti di copie superati, permessi mancanti).
- L’uso combinato di Tailwind CSS, shadcn/UI e TanStack mira a:
  - mantenere un design moderno e coerente,
  - velocizzare lo sviluppo di componenti riutilizzabili,
  - ridurre il codice boilerplate nella gestione dello stato dei dati.

