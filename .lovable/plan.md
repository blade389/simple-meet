# Riattivazione push OneSignal su flashmatch.org

## Cosa fai tu (2 minuti)
1. Vai su onesignal.com e recupera l'accesso all'account (login con Google o "Forgot password" sull'email usata ai tempi di Scopami).
2. Apri l'app con App ID `6c1a6559-422c-4b84-84c7-95574fcc3ae1`.
3. Settings > Push & In-App > Web configuration:
   - Site Name: `FlashMatch`
   - Site URL: `https://flashmatch.org`
   - Salva.
4. Facoltativo: rinomina l'app da "Scopami" a "FlashMatch" e aggiorna l'icona con il cuore rosa.

## Cosa faccio io dopo la tua conferma
- Verifico via API che `chrome_web_origin` sia diventato `https://flashmatch.org`.
- Controllo in preview che l'SDK si inizializzi senza errori e che compaia il prompt di iscrizione alle push.
- Test end-to-end: invio una richiesta di appuntamento e un messaggio in chat, e controllo nei log delle funzioni `send-push-notification` e `send-chat-message-notification` che la notifica risulti consegnata.
- Se il prompt non compare per utenti che avevano gia' negato il permesso sul vecchio dominio, aggiungo in Dashboard un avviso con pulsante "Attiva notifiche".

## Note tecniche
Il codice e' gia' pronto: `src/lib/onesignal.ts` (init + login), `AuthContext` collega l'external user id a ogni cambio di sessione, `public/OneSignalSDKWorker.js` e' servito dalla root, e le edge function usano l'API v16 con `include_aliases` e URL assoluti su https://flashmatch.org. Non serve alcuna modifica finche' il Site URL non e' corretto.
