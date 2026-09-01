# Analisi e redesign di FlashMatch

## Stato attuale osservato

La homepage presenta un'estetica generica da template di dating: gradiente rosa-viola, hero image AI di coppie al tramonto, numeri social proof non verificabili ("10K+", "95%", "4.8") e un CTA "Start Free Now" che contrasta con il modello a pagamento. La navigazione mobile manca di un menu hamburger. Il mix di lingue (titoli in inglese, pulsanti in italiano) genera confusione. Il modello di business (uomini pagano gettoni, donne fissano tariffe) richiede maggiore enfasi su trust, trasparenza e sicurezza.

## Sei miglioramenti proposti

1. **Riscrittura dell'hero per il nuovo target**
   - Sostituire "Start Free Now" con un CTA trasparente sul modello a pagamento (es. "Scopri come funziona" / "Crea il tuo profilo").
   - Spostare il disclaimer "non vincolante" subito sotto l'hero, in formato card visibile, non solo in fondo alla sezione "How It Works".
   - Aggiungere trust badges ("Verifica selfie obbligatoria", "Pagamento solo di persona", "Rimborso gettone garantito").

2. **Social proof credibile**
   - Rimuovere o sostituire i numeri generici con dati verificabili o testimonianze reali.
   - Se non ci sono recensioni reali, mostrare invece i benefici concreti (es. "Tariffe chiare prima di inviare la richiesta").

3. **Navigazione mobile completa**
   - Aggiungere un menu hamburger per mobile con accesso a Features, Pricing, FAQ, Login/Sign Up.
   - Migliorare il contrasto e la leggibilità del header su sfondo chiaro.

4. **Pagina Pricing più chiara**
   - Separare visivamente la sezione "Gettoni per uomini" da "Abbonamento donne".
   - Evidenziare il pacchetto più popolare con badge e bordo più marcato.
   - Aggiungere una sezione "Come funziona il pagamento" con icone e passaggi.

5. **Miglioramento UX della discovery (Browse / Premium Profiles)**
   - Correggere il raggio di ricerca a 50 km come da regola di business.
   - Aggiungere filtri visibili (età, distanza, profili verificati).
   - Migliorare le card profilo: foto più grande, badge verifica, tariffa visibile, distanza approssimativa (senza esporre coordinate).

6. **Allineamento stato pre-lancio e lingua**
   - Verificare se PreLaunchGuard e la pagina /prelaunch sono ancora attivi oltre la data di lancio.
   - Uniformare la lingua della homepage: decidere se italiano di default o inglese, e mantenere coerenza tra titoli, sottotitoli e pulsanti.

## Redesign grafico

Dopo aver implementato i sei miglioramenti, si procederà con un redesign completo seguendo il workflow standard:

```text
1. Cattura screenshot aggiornata della homepage.
2. Tre domande visive all'utente: palette colore, accoppiamento tipografico, layout base.
3. Generazione di 3 direzioni di design con vincoli bloccati (palette, font, layout) e variazioni su composizione/densità/movimento.
4. Presentazione delle 3 direzioni come preview cliccabili.
5. Implementazione della direzione scelta, copiando i token di design e la composizione esatta.
```

## Dettagli tecnici

- I file coinvolti per i miglioramenti rapidi: `src/pages/Index.tsx`, `src/pages/Pricing.tsx`, `src/pages/Browse.tsx`, `src/pages/PremiumProfiles.tsx`, `src/components/PreLaunchGuard.tsx`, `src/lib/prelaunch.ts`, `src/i18n/locales/*.json`.
- Per il redesign: `src/index.css`, `tailwind.config.ts`, componenti shadcn riutilizzati, asset hero.
- Verrà mantenuto il sistema di design token attuale (HSL in `index.css`, classi semantiche in Tailwind) senza hardcodare colori nei componenti.
- Le modifiche non toccheranno la logica backend (RLS, pagamenti, notifiche) se non strettamente necessario per l'UX.
