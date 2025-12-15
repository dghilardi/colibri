# PROJECT SPECIFICATION: CO-LIBRÌ (Comelit Corporate Library)

## 1. BRAND IDENTITY & UI GUIDELINES (STRICT)
L'app si chiama **"CO-LIBRÌ"**.
- **Naming:** Gioco di parole tra "CO" (prefisso aziendale Comelit: Connection, Co-operation) e "Libri".
- **Filosofia:** "With You Always". L'app è un compagno fedele e leggero.
L'interfaccia deve essere accessibile, pulita e supportare l'utente.
- **Palette:**
  - `primary`: '#00BC70' (Comelit Green - Azioni, conferme, badge "Disponibile").
  - `secondary`: '#1C1F28' (Comelit Blue - Navbar, Splash Screen, theme-color).
  - `neutral`: '#D8DFE1' (Sfondi tecnici).
- **UI Elements:** Forme arrotondate (`rounded-2xl`). Uso del cerchio (simbolo infinito) per avatar e status.
- **UX:** Feedback immediato. Autocompletamento intelligente.

- **PWA Manifest:**
  - `name`: "CO-LIBRÌ - Comelit Library"
  - `short_name`: "CoLibrì"
  - `theme_color`: "#1C1F28"
  - `background_color`: "#1C1F28"
  - `display`: "standalone"
  - `icons`: Icone basate sul cerchio/simbolo infinito ("Il segno nel segno") .

## 2. TECH STACK
- **Frontend:** Next.js (App Router), Shacdn, Tailwind CSS.
- **PWA Engine:** `@serwist/next` (Gestione Service Worker avanzata).
- **State Management:** `TanStack Query` (React Query) - PER il caching e la sync offline.
- **Backend:** Next.js API Routes (o Server Actions).
- **Database:** MongoDB (Mongoose).
- **Auth:** NextAuth.js (OIDC Provider).
- **Integrazioni Esterne:** OpenLibrary API (per recupero metadati libri).
- **Scanner:** `react-zxing` (lettura barcode da browser).
- **DevOps:** Docker, Kubernetes support (ConfigMaps/Secrets).

## 3. PWA & OFFLINE STRATEGY
- **Network Awareness:** Hook `useNetworkStatus`.
- **UI Offline:**
  - Banner discreto: "Offline Mode".
  - Disabilitazione azioni di scrittura (Prenota/Restituisci).
  - Catalogo e ricerca funzionanti in sola lettura (cache).
- **Caching Strategy:**
  - Assets statici (Font Montserrat, CSS): Cache-First.
  - API Dati Libri: Stale-While-Revalidate (mostra subito cache, aggiorna se online).

## 4. CONFIGURAZIONE & SICUREZZA

### A. Gestione Admin
- I privilegi di Admin sono definiti tramite Variabile d'Ambiente: `ADMIN_EMAILS="jane@comelit.com,mario@comelit.com"`.
- Al login, se l'email dell'utente è nella lista, ottiene il ruolo `ADMIN` (accesso alla Dashboard).

### B. Multi-Libreria e Permessi (JSON Based)
- I libri sono divisi in "Librerie" logiche (es. "R&D", "Marketing", "Public").
- I permessi di visualizzazione sono definiti in un file JSON montato nel container a runtime: `/conf/library-grants.json`.
- **Formato JSON:** `{"email_utente": "nome_libreria_1|nome_libreria_2"}`.
- *Logica:* Un utente vede e prenota SOLO i libri appartenenti alle librerie a cui ha accesso. Se l'email non è nel JSON, vede solo "default|public".

## 4. CORE FEATURES

### A. Catalogo Utente (Filtrato)
- Mostra solo i libri delle librerie permesse.
- Ricerca e Filtri per Libreria.
- Quick action: sui libri ricercati l'utente può segnarli come presi in prestito (se sono disponibili) o restituiti (se li aveva presi in prestito lui o ha privilegi di admin).
- **Smart Scan (Prestito):** Inquadra barcode -> Riconosce libro -> Prestito/Restituzione (come spec precedente).

### B. Admin Dashboard (Solo Admin)
- Sezione protetta (sfondo `secondary` più scuro per distinguerla).
- **Gestione Libri:**
  - Aggiunta nuovi libri.
  - Modifica stato forzata (es. Segna come "Restituito" se l'utente ha dimenticato).
- **Smart Add (Inserimento):**
  - Input form con Barcode Scanner integrato.
  - *Scan ISBN o ricerca manuale tramite ISBN o titolo:* Interroga **OpenLibrary API**.
  - Se trova match: Pre-compila Titolo, Autore, Copertina.
  - L'admin seleziona la "Libreria" di destinazione.

### C. Wishlist & "Promozione"
- **User Side:** Un utente può suggerire un libro.
  - Anche qui: Scan/ISBN -> Fetch da OpenLibrary -> Aggiungi a Wishlist.
  - Specifica per quale "Libreria" lo suggerisce (se ne ha visibilità).
- **Automation (Deduplica):**
  - Quando un Admin aggiunge un libro al catalogo (o clicca "Promuovi" dalla Wishlist):
  - Il sistema controlla se quel libro (ISBN) esiste nelle Wishlist per quella libreria.
  - Se sì, il libro viene creato nel catalogo e rimosso automaticamente dalla Wishlist.

## 5. DATA MODEL (Mongoose)

- **User:** Dati da OIDC + Role (calcolato da ENV) + AllowedLibraries (array stringhe, calcolato da JSON).
- **Book:**
  - `isbn`: String (index)
  - `library`: String (es. "cloud-office") - **CRITICO per i filtri**
  - `title`, `author`, `coverUrl`, `description`
  - `status`: Enum['AVAILABLE', 'BORROWED']
  - `currentLoan`: Ref Loan
- **Loan:** `bookId`, `userId`, `dates...`
- **WishlistRequest:**
  - `isbn`: String
  - `libraryTarget`: String
  - `requestedBy`: Ref User
  - `meta`: { title, author, cover } (cache da OpenLibrary)
  - `createdAt`: Date

## 6. DEVOPS & INITIALIZATION
- **Dockerfile:** Next.js standalone.
- **Volume:** Istruzioni per montare il file JSON in `/conf/library-grants.json`.
- **Logic:** Creare un'utility (es. `lib/permissions.js`) che legge il file JSON (cached o letto a ogni request) e la ENV `ADMIN_EMAILS` per determinare i permessi dell'utente corrente.

