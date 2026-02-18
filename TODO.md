# Todo – CopyTrack

Lista di attività da completare per il progetto. Usa questo file come roadmap.

---




- [ ] **Inserire filtri (input) in tabelle legati al backend, non in client**  
  Aggiungere campi di filtro/ricerca nelle tabelle che inviano i criteri al backend (query params o body). Il filtraggio deve avvenire lato server (API) e non sul dataset già caricato in client, così da supportare grandi volumi di dati e paginazione coerente.

---

## Architettura frontend



- [ ] **Gestire ErrorBoundary localmente nelle tabelle**  
  Implementare ErrorBoundary specifici per ogni tabella (DataTable) per gestire errori di caricamento dati in modo isolato, senza bloccare l'intera applicazione.

---

## CRUD


- [ ] **Controllare CRUD in tabelle**  
  Verificare e testare tutte le operazioni CRUD nelle tabelle esistenti (docenti, utenti) per assicurarsi che funzionino correttamente e gestiscano gli errori in modo appropriato.

- [ ] **Implementare pagina tabella registrazioni con CRUD**  
  Creare una pagina dedicata per la gestione delle registrazioni copie con:
  - Tabella impaginata delle registrazioni
  - Operazioni CRUD complete (Create, Read, Update, Delete)
  - Filtri e ricerca avanzata

- [ ] **Implementare reset docenti con possibilità di cambiare i limiti**  
  Nella funzionalità di reset docenti, aggiungere la possibilità di modificare i limiti di copie per ogni docente durante l'operazione di reset.

- [ ] **Export Excel tabella**  
  Implementare funzionalità di esportazione in formato Excel per le tabelle (docenti, utenti, registrazioni). Permettere l'esportazione dei dati filtrati/visualizzati nella tabella corrente.

- [ ] **Bottone segnalazione inserimento errato**  
  Aggiungere un bottone/meccanismo per segnalare inserimenti errati nei dati delle tabelle. Implementare un sistema di segnalazione che permetta agli utenti di notificare errori nei record inseriti.

---

## UI/UX

- [ ] **Inserire landing page**  
  Creare una pagina di benvenuto/landing page per l'applicazione con informazioni sul sistema e accesso rapido alle funzionalità principali.

- [ ] **Cambiare logo**  
  Sostituire il logo attuale dell'applicazione con il nuovo logo del progetto.

---

## Autenticazione e sicurezza

- [ ] **Inserire recupero password per collaboratori**  
  Implementare funzionalità di recupero password per i collaboratori:
  - Form di richiesta reset password (email)
  - Invio email con link di reset
  - Pagina di reset password con token
  - Validazione token e aggiornamento password

- [ ] **Recupero password per admin**  
  Implementare funzionalità di recupero password per gli amministratori:
  - Form di richiesta reset password (email)
  - Invio email con link di reset
  - Pagina di reset password con token
  - Validazione token e aggiornamento password

- [ ] **Check perché il login automatico da mobile non funziona**  
  Investigare e risolvere il problema del login automatico che non funziona su dispositivi mobile. Verificare:
  - Gestione del token JWT su mobile
  - Storage locale (localStorage/sessionStorage) su mobile
  - Cookie e loro persistenza
  - Possibili problemi di CORS o sicurezza specifici per mobile

---



---

*Ultimo aggiornamento: febbraio 2026*
