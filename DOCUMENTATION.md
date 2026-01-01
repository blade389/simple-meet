# SCOPAMI - Documentazione Completa

## Indice
1. [Panoramica](#panoramica)
2. [Autenticazione](#autenticazione)
3. [Profili Utente](#profili-utente)
4. [Sistema di Verifica](#sistema-di-verifica)
5. [Navigazione e Ricerca](#navigazione-e-ricerca)
6. [Sistema di Match](#sistema-di-match)
7. [Chat](#chat)
8. [Appuntamenti](#appuntamenti)
9. [Sistema di Recensioni](#sistema-di-recensioni)
10. [Sistema Premium](#sistema-premium)
11. [Token](#token)
12. [Pannello Admin](#pannello-admin)
13. [Notifiche](#notifiche)
14. [Struttura Database](#struttura-database)
15. [Edge Functions](#edge-functions)

---

## Panoramica

SCOPAMI è una piattaforma di incontri che permette agli utenti di connettersi, chattare e organizzare appuntamenti. Il sistema include verifica dell'identità, recensioni, profili premium e un sistema di moderazione amministrativa.

### Stack Tecnologico
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Lovable Cloud)
- **Autenticazione**: Supabase Auth
- **Database**: PostgreSQL
- **Notifiche Push**: OneSignal
- **Email**: Resend
- **Pagamenti**: Stripe

---

## Autenticazione

### Registrazione (`/auth`)
- Registrazione con email e password
- Campi richiesti: nome, email, password, genere, data di nascita
- Auto-conferma email abilitata
- Creazione automatica profilo dopo registrazione

### Login
- Accesso con email e password
- Gestione sessione tramite Supabase Auth
- Redirect automatico alla dashboard dopo login

### Ruoli Utente
- **user**: Utente standard
- **admin**: Accesso al pannello di amministrazione

---

## Profili Utente

### Informazioni Profilo
- Nome e cognome
- Data di nascita (con calcolo età automatico)
- Genere (maschio/femmina)
- Bio/Descrizione
- Località (città, latitudine, longitudine)
- Foto profilo (con verifica)
- Foto aggiuntive (fino a 5)

### Preferenze
- Range di età preferito (min_age_preference, max_age_preference)
- Sblocco preferenze età (age_preferences_unlocked) - funzionalità premium

### Stati Profilo
- **is_verified**: Profilo verificato tramite documento
- **photo_verification_status**: Stato verifica foto (pending, verified, rejected)
- **is_blocked**: Utente bloccato dal sistema

### Contatori
- **positive_reviews_count**: Recensioni positive ricevute (rating >= 3)
- **negative_reviews_count**: Recensioni negative ricevute (rating < 3)

---

## Sistema di Verifica

### Verifica Foto (`verification_photos`)
- Upload foto profilo
- Foto primaria e foto aggiuntive
- Stati: pending, verified, rejected
- Trigger automatico per aggiornare profilo dopo verifica

### Verifica Identità (`identity_verifications`)
- Upload documento di identità
- Verifica manuale da admin
- Stati: pending, verified, rejected
- Campo note per feedback admin

### Flusso di Verifica
1. Utente carica foto/documento
2. Admin riceve notifica
3. Admin approva o rifiuta
4. Utente riceve email con esito
5. Profilo aggiornato automaticamente

---

## Navigazione e Ricerca

### Browse (`/browse`)
- Vista swipe stile Tinder
- Filtri per distanza
- Ordinamento per distanza o data registrazione
- Esclusione automatica profili bloccati
- Rispetto preferenze età del profilo visualizzato

### Favorites (`/favorites`)
- Lista profili aggiunti ai preferiti
- Possibilità di rimuovere dai preferiti

### Profili Premium (`/premium-profiles`)
- Visualizzazione profili con abbonamento premium

---

## Sistema di Match

### Richieste di Match (`match_requests`)
- Invio richiesta da utente a profilo
- Stati: pending, accepted, rejected, expired
- Messaggio opzionale con richiesta
- Scadenza automatica dopo 48 ore

### Richieste Premium
- Flag `is_premium` per richieste inviate da utenti premium
- Costo: 1 token per richiesta premium
- Rimborso automatico token se rifiutata

### Flusso Match
1. Utente invia richiesta (con o senza messaggio)
2. Destinatario riceve notifica email
3. Destinatario può accettare o rifiutare
4. Se accettata: si apre la chat
5. Se rifiutata: notifica al mittente

---

## Chat

### Messaggi (`chat_messages`)
- Chat testuale tra utenti matchati
- Timestamp per ogni messaggio
- Flag `is_read` per stato lettura

### Stati Chat (`chat_status` in match_requests)
- **active**: Chat attiva
- **closed**: Chat chiusa (dopo scadenza deadline)

### Funzionalità
- Invio messaggi in tempo reale
- Notifiche push per nuovi messaggi
- Visualizzazione stato online/ultimo accesso
- Possibilità di bloccare utente

---

## Appuntamenti

### Creazione Appuntamento (`appointments`)
- Proposta data e ora
- Luogo dell'incontro
- Note aggiuntive
- Stati: pending, confirmed, completed, cancelled

### Deadline Appuntamento
- `appointment_deadline`: Tempo limite per fissare appuntamento
- Impostato automaticamente quando match accettato
- Default: 1 ora (configurabile)

### Flusso Appuntamento
1. Utente propone appuntamento in chat
2. Altro utente conferma
3. Promemoria automatici via email
4. Dopo appuntamento: richiesta recensione

### Notifiche
- Email quando appuntamento confermato
- Reminder prima dell'appuntamento
- Notifica scadenza deadline

---

## Sistema di Recensioni

### Recensioni (`reviews`)
- Rating da 1 a 5 stelle
- Commento testuale
- Collegamento a match_request
- `has_reported`: Flag per segnalazioni

### Admin Notes (`admin_notes`)
- Note aggiunte dagli admin
- Collegate a reviewer_id e reviewed_id
- Usate per tracciare segnalazioni

### Tipi di Segnalazione
- Recensione negativa (rating < 3)
- Segnalazione esplicita (has_reported = true)

### Azioni Admin
- **Scala Gettone (Maschio)**: Deduce 1 token all'utente maschio
- **Scala Gettone (Femmina)**: Deduce 1 token all'utente femmina
- **Blocca Maschio**: Blocca l'utente maschio
- **Blocca Femmina**: Blocca l'utente femmina

### Email Automatiche
- Notifica all'utente quando admin prende azione
- Template diversi per ogni tipo di azione

---

## Sistema Premium

### Abbonamenti (`premium_subscriptions`)
- Gestione tramite Stripe
- Campi: stripe_subscription_id, status, current_period_start/end
- Stati: active, cancelled, past_due, etc.

### Vantaggi Premium
- Profilo evidenziato
- Sblocco preferenze età
- Richieste premium (visibilità maggiore)
- Badge premium sul profilo

### Flusso Abbonamento
1. Utente seleziona piano (`/premium-subscription`)
2. Redirect a Stripe Checkout
3. Webhook Stripe aggiorna database
4. Accesso immediato a funzionalità premium

### Gestione
- Customer Portal Stripe per gestione abbonamento
- Cancellazione in qualsiasi momento
- Rinnovo automatico

---

## Token

### Sistema Token (`tokens`)
- Valuta interna della piattaforma
- Usati per richieste premium
- Acquistabili tramite Stripe

### Acquisto Token (`/buy-tokens`)
- Pacchetti predefiniti
- Pagamento tramite Stripe
- Accredito immediato dopo pagamento

### Uso Token
- 1 token = 1 richiesta premium
- Rimborso automatico se richiesta rifiutata
- Deduzione come sanzione da admin

---

## Pannello Admin

### Dashboard Admin (`/admin`)
Accessibile solo a utenti con ruolo admin.

#### Sezioni:
1. **Verifica Foto**: Approvazione/rifiuto foto profilo
2. **Verifica Identità**: Approvazione/rifiuto documenti
3. **Gestione Premium**: Gestione richieste premium in attesa
4. **Profili Premium**: Lista profili con abbonamento
5. **Segnalazioni e Recensioni**: Gestione segnalazioni e recensioni negative
6. **Utenti Bloccati**: Lista e gestione utenti bloccati
7. **Tariffe Premium**: Configurazione prezzi abbonamenti

### Azioni Admin
- Approvare/rifiutare verifiche
- Bloccare/sbloccare utenti
- Scalare token come sanzione
- Aggiungere note admin
- Visualizzare storico conversazioni

### Notifiche Admin
- Email quando nuova verifica in attesa
- Email per nuove segnalazioni

---

## Notifiche

### Email (Resend)
- Nuova richiesta di match
- Richiesta accettata
- Appuntamento confermato
- Reminder appuntamento
- Verifica approvata/rifiutata
- Foto approvata
- Azioni admin (sanzioni)
- Reminder recensione

### Push Notifications (OneSignal)
- Nuovi messaggi chat
- Nuove richieste
- Reminder vari

### Configurazione
- RESEND_API_KEY per email
- ONESIGNAL_APP_ID e ONESIGNAL_REST_API_KEY per push

---

## Struttura Database

### Tabelle Principali

```
profiles
├── id (uuid, PK)
├── user_id (uuid, FK auth.users)
├── first_name, last_name
├── birth_date
├── gender (enum: male, female)
├── bio
├── city, latitude, longitude
├── profile_photo_url
├── is_verified, is_blocked
├── photo_verification_status
├── min_age_preference, max_age_preference
├── age_preferences_unlocked
├── positive_reviews_count, negative_reviews_count
└── created_at, updated_at

match_requests
├── id (uuid, PK)
├── sender_id, receiver_id (FK profiles)
├── status (enum: pending, accepted, rejected, expired)
├── message
├── is_premium
├── chat_status
├── appointment_deadline
└── created_at, updated_at

chat_messages
├── id (uuid, PK)
├── match_request_id (FK match_requests)
├── sender_id (FK profiles)
├── message
├── is_read
└── created_at

appointments
├── id (uuid, PK)
├── match_request_id (FK match_requests)
├── proposed_by (FK profiles)
├── proposed_date
├── location
├── notes
├── status
└── created_at

reviews
├── id (uuid, PK)
├── match_request_id (FK match_requests)
├── reviewer_id, reviewed_id (FK profiles)
├── rating (1-5)
├── comment
├── has_reported
└── created_at

tokens
├── id (uuid, PK)
├── user_id (FK profiles)
├── amount
└── last_updated

premium_subscriptions
├── id (uuid, PK)
├── user_id (FK profiles)
├── stripe_customer_id
├── stripe_subscription_id
├── status
├── current_period_start, current_period_end
└── created_at, updated_at
```

### Enum Types
- **gender**: male, female
- **verification_status**: pending, verified, rejected
- **appointment_status**: pending, confirmed, completed, cancelled
- **app_role**: user, admin

### Funzioni Database
- `calculate_distance`: Calcolo distanza Haversine
- `is_blocked_between`: Verifica blocco tra utenti
- `viewer_in_age_range`: Verifica compatibilità età
- `update_review_counts`: Aggiorna contatori recensioni
- `refund_token_on_premium_reject`: Rimborso token automatico

---

## Edge Functions

### Autenticazione e Pagamenti
- `create-premium-checkout`: Crea sessione Stripe per abbonamento
- `create-token-payment`: Crea sessione Stripe per acquisto token
- `customer-portal`: Redirect a portale cliente Stripe
- `check-premium-subscription`: Verifica stato abbonamento
- `stripe-webhook`: Gestione webhook Stripe

### Notifiche Email
- `send-match-request-email`: Email nuova richiesta
- `send-request-accepted-email`: Email richiesta accettata
- `send-appointment-scheduled`: Email appuntamento confermato
- `send-appointment-reminders`: Reminder appuntamenti
- `send-chat-message-notification`: Notifica nuovo messaggio
- `send-verification-approved`: Email verifica approvata
- `send-photo-approved`: Email foto approvata
- `send-review-action-email`: Email azioni admin su recensioni
- `send-review-reminders`: Reminder per lasciare recensione
- `send-reminder-emails`: Email reminder generiche
- `send-admin-review-notification`: Notifica admin nuova segnalazione

### Push Notifications
- `send-push-notification`: Invio notifiche push OneSignal

### Processi Automatici (Cron)
- `process-expired-requests`: Scadenza richieste non risposte
- `process-appointment-deadlines`: Gestione deadline appuntamenti
- `process-completed-appointments`: Gestione appuntamenti completati
- `process-completed-reviews`: Elaborazione recensioni completate
- `process-expired-reviews`: Gestione recensioni scadute

---

## Sicurezza

### Row Level Security (RLS)
Tutte le tabelle hanno RLS abilitato con policy specifiche:
- Utenti possono vedere/modificare solo i propri dati
- Admin hanno accesso completo
- Blocchi reciproci rispettati nelle query

### Validazioni
- Verifica età minima (18 anni)
- Validazione email
- Sanitizzazione input
- Rate limiting su API

### Storage
- `profile-photos`: Bucket pubblico per foto profilo
- `verification-docs`: Bucket privato per documenti

---

## Configurazione Ambiente

### Secrets Richiesti
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
ONESIGNAL_APP_ID
ONESIGNAL_REST_API_KEY
CRON_SECRET
```

### Variabili Frontend (.env)
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

---

## Pagine dell'Applicazione

| Route | Descrizione | Accesso |
|-------|-------------|---------|
| `/` | Landing page | Pubblico |
| `/auth` | Login/Registrazione | Pubblico |
| `/dashboard` | Dashboard utente/admin | Autenticato |
| `/profile` | Modifica profilo | Autenticato |
| `/browse` | Sfoglia profili | Autenticato + Verificato |
| `/favorites` | Profili preferiti | Autenticato |
| `/appointments` | Gestione appuntamenti | Autenticato |
| `/buy-tokens` | Acquisto token | Autenticato |
| `/premium-subscription` | Abbonamento premium | Autenticato |
| `/premium-profiles` | Profili premium | Autenticato |
| `/blocked-users` | Utenti bloccati | Autenticato |
| `/admin` | Pannello admin | Admin |
| `/admin/user-reviews` | Segnalazioni e recensioni | Admin |
| `/admin/premium-rates` | Tariffe premium | Admin |
| `/about` | Chi siamo | Pubblico |
| `/features` | Funzionalità | Pubblico |
| `/pricing` | Prezzi | Pubblico |
| `/faq` | FAQ | Pubblico |
| `/privacy-policy` | Privacy Policy | Pubblico |
| `/terms-of-service` | Termini di Servizio | Pubblico |
| `/cookie-policy` | Cookie Policy | Pubblico |

---

## Note di Manutenzione

### Backup
- Il versioning di Lovable funge da sistema di backup
- Ogni modifica crea un punto di ripristino
- Possibile tornare a qualsiasi versione precedente

### Monitoraggio
- Console logs per debug frontend
- Edge function logs per debug backend
- Analytics Supabase per monitoraggio database

### Aggiornamenti
- Testare sempre in ambiente di sviluppo
- Verificare RLS dopo modifiche schema
- Controllare webhook Stripe dopo modifiche pagamenti

---

*Documentazione aggiornata al: Gennaio 2026*
