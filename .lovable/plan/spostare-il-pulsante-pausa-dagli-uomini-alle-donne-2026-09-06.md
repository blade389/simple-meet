# Spostare il pulsante "Pausa" dagli uomini alle donne

## Stato attuale
- Il pulsante pausa (icona Pause/Play in alto nella Dashboard) e il banner "Profilo in pausa" sono mostrati solo agli account **uomo** (`src/pages/Dashboard.tsx`).
- Il campo `profiles.is_paused` esiste già nel database, quindi nessuna modifica strutturale serve.

## Modifiche

### 1. Dashboard (`src/pages/Dashboard.tsx`)
- Mostrare pulsante pausa e banner solo se `gender === 'female'` (oggi è `male`).
- Aggiornare il testo del banner: la donna in pausa **non riceve nuove richieste** e **non compare nelle ricerche/vetrine** finché non riattiva il profilo.

### 2. Visibilità e richieste
- **Browse (`src/pages/Browse.tsx`)**: escludere dalla lista i profili donna con `is_paused = true` e disattivare il pulsante "Invia richiesta" verso profili in pausa.
- **Vetrina homepage (RPC `get_showcase_profiles`)**: nuova migrazione che aggiorna la funzione per escludere i profili in pausa.

### 3. Traduzioni
- Aggiornare le chiavi `dashboard.pauseProfile`, `dashboard.resumeProfile`, `dashboard.pauseBanner`, `dashboard.pauseEnabled/Disabled` in tutte le 8 lingue, con tono rivolto alle donne.

### 4. Verifica
- Build + controllo visivo: un account donna vede il pulsante, si mette in pausa, sparisce dalla vetrina/Browse e non può ricevere richieste; gli uomini non vedono più il pulsante.

## Dettagli tecnici
- Nessuna colonna nuova: si riusa `profiles.is_paused`.
- La migrazione aggiorna solo la RPC esistente (`CREATE OR REPLACE FUNCTION get_showcase_profiles`), nessuna tabella nuova.
