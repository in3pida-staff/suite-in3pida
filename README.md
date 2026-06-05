# in3pida Suite — `suite.in3pida.it`

Hub di lancio per le app in3pida. HTML/CSS/JS statico su GitHub Pages, stesso
progetto Supabase di monitoring/ISI. Accesso unico (SSO): chi entra nella suite
apre le app senza rifare il login.

## Struttura
```
docs/
  index.html   → hub (griglia app + SSO + gestione utenti per l'admin)
  login.html   → schermata di accesso (email + password)
  CNAME        → suite.in3pida.it
supabase/
  schema.sql                          → tabella suite_permissions + RLS
  functions/suite-admin-users/        → Edge Function (lista utenti, sola lettura)
```

## Attivazione (3 passi, da fare una volta sola)

### 1. Database — crea la tabella
Apri **Supabase → SQL Editor**, incolla il contenuto di [`supabase/schema.sql`](supabase/schema.sql) e premi **Run**.
È sicuro: crea solo la nuova tabella `suite_permissions`, non tocca nulla di esistente.

### 2. Edge Function — abilita la gestione utenti
Dal terminale, nella cartella del progetto:
```bash
supabase functions deploy suite-admin-users
```
Serve solo per la sezione "Utenti" (visibile solo a mario@in3pida.it). Senza,
la suite funziona comunque: la pagina Utenti mostra un avviso di "non attiva".

### 3. GitHub Pages + dominio
- Repo **Settings → Pages → Source: `main` / cartella `/docs`**.
- Sul DNS, record **CNAME** `suite` → `in3pida-staff.github.io`.

## Aggiungere una nuova app
Aggiungi un oggetto all'array `APPS` in [`docs/index.html`](docs/index.html):
```js
{ id:'slug', label:'Nome', url:'https://...', icon_emoji:'✨', description:'...', features:['a','b'] }
```
Se `url` è vuoto, la card mostra "Prossimamente" e non è cliccabile.

## Permessi (chi vede cosa)
- **mario@in3pida.it**: vede tutte le app + la sezione "Utenti".
- **Altri utenti**: vedono solo le app con "App visibile" attiva nel loro profilo.
- Ruolo `personalizzato` → si scelgono le singole funzionalità visibili per quell'app.
