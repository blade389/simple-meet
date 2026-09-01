# Riattivazione push su flashmatch.org

Site URL OneSignal aggiornato lato dashboard. Ora completo la parte app.

## Cosa faccio
1. Verifica in preview che l'SDK OneSignal si inizializzi senza errori (console pulita, nessun mismatch di origin) e che il service worker si registri.
2. Prompt di iscrizione: oggi il permesso non viene mai chiesto in modo esplicito. Aggiungo un invito visibile in Dashboard ("Attiva le notifiche") che chiama il prompt OneSignal e sparisce quando il permesso e' gia' concesso, cosi' anche chi aveva negato sul vecchio dominio puo' riattivarle.
3. Allineo `send-push-notification` all'API v16 usando `include_aliases: { external_id: [...] }` (oggi usa il campo deprecato `include_external_user_ids`) e imposto URL assoluti su https://flashmatch.org.
4. Test end-to-end: iscrizione push dal browser, invio di una richiesta di appuntamento e di un messaggio in chat, controllo dei log delle funzioni per confermare la consegna.

## Note tecniche
- `src/lib/onesignal.ts` espone gia' `showOneSignalPrompt` e `isPushEnabled`: la nuova card in Dashboard le riusa, nessuna nuova dipendenza.
- `AuthContext` collega gia' l'external id OneSignal all'utente a ogni login.
- Nessuna modifica a schema DB o secrets.
