# Piano: risolvere "email rate limit exceeded" in registrazione

## Problema
Durante la registrazione di un nuovo account compare l’errore `email rate limit exceeded`. Questo accade quando il progetto Supabase Auth ha superato il numero massimo di email inviabili nell’ultima ora (conferme registrazione, reset password, magic link).

## Soluzione
Aumentare il limite orario di email auth (`rate_limit_email_sent`) tramite le impostazioni di Supabase Auth.

## Passi
1. Verificare il limite attuale di email inviate per ora nelle impostazioni auth.
2. Alzare `rate_limit_email_sent` a un valore più alto (es. 100 o 300 email/ora) usando `supabase--configure_auth`.
3. Testare immediatamente una nuova registrazione per confermare che l’errore non si ripeta.

## Nota
Se l’invio email non è attivo sul progetto (dominio email non verificato / email provider disattivato), il tool potrebbe rifiutare l’aumento. In quel caso sarà necessario prima attivare l’email provider o verificare il dominio.
