# Piano: evitare che l'email di conferma registrazione finisca in spam

## Diagnosi
- Il dominio email `notify.flashmatch.org` è verificato e la coda di invio è sana.
- L'email di benvenuto viene inviata dal tuo dominio con autenticazione corretta (per questo arriva in posta in arrivo).
- Le email di autenticazione (conferma registrazione, reset password) invece non sono ancora state configurate sul tuo dominio: partono dal mittente predefinito condiviso, che i provider di posta classificano spesso come spam.

## Soluzione
Configurare le email di autenticazione sul tuo dominio verificato, così anche la conferma di registrazione partirà da `notify.flashmatch.org` con firma corretta.

## Passi
1. Generare i modelli delle email di autenticazione (conferma registrazione, reset password, magic link, ecc.) collegati al dominio verificato.
2. Applicare lo stile del brand FlashMatch ai modelli (colori del tema scuro, tono dei testi, lingua italiana).
3. Pubblicare la configurazione lato backend.
4. Test: registrare un account di prova e verificare che l'email di conferma arrivi in posta in arrivo invece che in spam.

## Nota
Se dopo la modifica alcune email finiscono ancora in spam, è normale nelle prime settimane: la reputazione del nuovo dominio si costruisce con il tempo. Nel frattempo, chiedere ai tester di segnare "Non spam" aiuta ad accelerare il processo.
