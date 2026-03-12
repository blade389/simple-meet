

## Piano: Bypass pre-lancio per account specifici

**Obiettivo**: Permettere a 2 email specifiche di navigare tutte le pagine come se il sito fosse già live, bypassando il guard pre-lancio.

### Approccio

Modificare `PreLaunchGuard.tsx` per controllare l'utente corrente (da `useAuth`) e, se la sua email è nella lista di bypass, saltare il redirect a `/prelaunch`.

Aggiornare anche `isRouteAllowed` in `prelaunch.ts` per accettare un parametro opzionale email, così che la logica sia coerente ovunque venga usata.

### Modifiche

1. **`src/lib/prelaunch.ts`** — Aggiungere una lista `BYPASS_EMAILS` con le 2 email e modificare `isRouteAllowed` per accettare un parametro `userEmail` opzionale. Se l'email è nella lista, restituisce sempre `true`.

2. **`src/components/PreLaunchGuard.tsx`** — Importare `useAuth`, passare `user?.email` a `isRouteAllowed`.

### Note
- Le email saranno hardcodate nel codice frontend. Non è un rischio di sicurezza perché non concedono permessi speciali, solo la visualizzazione delle pagine.
- Ti chiederò le 2 email prima di procedere con l'implementazione.

