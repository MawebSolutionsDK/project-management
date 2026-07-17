# Maweb Solutions – Internt system

Internt projektstyrings- og driftssystem for Maweb Solutions: kunder, leads, projekter, vedligeholdelsesaftaler, support, udgifter, produkter og mail-overvågning. Bygget som et enkeltbruger-værktøj (kun Magnus har login) til at holde styr på hele forretningen ét sted.

Live på: `https://system.mawebsolutions.dk`

## Stack

- **Next.js 14** (App Router) + TypeScript, strict mode
- **Supabase** (Postgres + Auth) via `@supabase/ssr` — Row Level Security aktiveret på alle tabeller
- **Tailwind CSS**, tokenbaseret mørkt tema (`tailwind.config.ts`)
- **Deploy:** Vercel (Hobby-plan)
- **Domæne:** `system.mawebsolutions.dk` (DNS hos Simply.com)
- **ESLint:** `next/core-web-vitals` (inkl. `eslint-plugin-jsx-a11y`)

## Moduler

| Modul | Rute | Formål |
|---|---|---|
| Oversigt | `/dashboard` | KPI'er, grafer, seneste aktivitet, notifikationer |
| Kunder | `/kunder` | Kundekartotek, 360°-visning pr. kunde (projekter, aftaler, support, mails) |
| Leads | `/leads` | Salgspipeline, Kanban- eller listevisning |
| Projekter | `/projekter` | Projektstyring fra forespørgsel til afsluttet, CSV-eksport |
| Vedligeholdelse | `/vedligeholdelse` | Hosting-/vedligeholdelsesaftaler (1/2/3-års perioder, automatisk fornyelsesdato) |
| Support | `/support` | Supportsager — solgt og sporet separat fra vedligeholdelse |
| Udgifter | `/udgifter` | Løbende software-/plugin-omkostninger |
| Produkter | `/produkter` | Genbrugelige produkt-/pris-skabeloner til projekter og aftaler |
| Mails | `/mails` | Automatisk overvåget indbakke, matchet mod kunder/leads |
| Notifikationer | `/notifikationer` | Samlet liste over forfaldne/kommende opfølgninger, deadlines, fornyelser |
| Aktivitet | `/aktivitet` | Kronologisk log over oprettelser og statusændringer på tværs af alle moduler |

Global søgning: `Ctrl/Cmd + K` fra hvor som helst i systemet.

## 1. Miljøvariabler

Kopiér `.env.example` til `.env.local` og udfyld:

```
NEXT_PUBLIC_SUPABASE_URL=https://trjuqgpmbnjvptwtvyon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>

# Kun nødvendige for mail-integrationen, se afsnit 6
SUPABASE_SERVICE_ROLE_KEY=
MAIL_SYNC_SECRET=
MA_IMAP_USER=
MA_IMAP_PASSWORD=
```

Værdier findes i Supabase Dashboard → Project Settings → API.

## 2. Databasen

Skemaet ligger som fortløbende migrationer i `supabase/migrations/`. Der er **ingen automatisk migrations-pipeline** (Claude/MCP har ikke skriveadgang til Supabase-projektet) — hver ny migration skal køres manuelt:

1. Åbn Supabase Dashboard → SQL Editor → New query.
2. Indsæt indholdet af den nyeste `.sql`-fil i `supabase/migrations/`.
3. Kør den.

Alle tabeller har Row Level Security aktiveret med én politik: enhver logget ind (`authenticated`) bruger har fuld adgang. Det er en bevidst beslutning for et enkeltbruger-system — den reelle adgangsspærre er at offentlig sign-up er slukket (se afsnit 3, trin 2).

## 3. Opret admin-bruger i Supabase (kun én, ingen offentlig sign-up)

1. Supabase Dashboard → Authentication → Users → **Add user** → indtast email + adgangskode.
2. Supabase Dashboard → Authentication → Providers → Email → sluk **"Allow new users to sign up"**.

Kun den bruger, du selv opretter her, kan logge ind.

## 4. Lokal udvikling

```
npm install
npm run dev
```

Andre nyttige scripts:

```
npm run build   # produktionsbuild
npm run lint    # ESLint
npx tsc --noEmit  # typecheck
```

## 5. Deploy til Vercel

1. Vercel → Import Git Repository → `MawebSolutionsDK/project-management`.
2. Environment Variables: tilføj alle variabler fra `.env.example` (se afsnit 1 og 6).
3. Deploy. Push til `main` udløser automatisk et nyt deploy.
4. Domæne: Vercel-projektet → Settings → Domains → tilføj `system.mawebsolutions.dk`, og opret den viste CNAME hos Simply.com.

## 6. Mail-integration (ma@mawebsolutions.dk)

Overvåger indbakken via IMAP (`mail.simply.com`, port 143 + STARTTLS), matcher afsendere mod kunder/leads (præcis adresse, dernæst domæne — undtagen almindelige gratis mail-udbydere som gmail/hotmail), og logger dem i `emails`-tabellen. **Ingen mailtekst gemmes** — kun afsender, emne, dato og et kort uddrag (op til 500 tegn) til brug ved oprettelse af supportsager.

Kører automatisk hvert 15. minut via GitHub Actions (`.github/workflows/mail-sync.yml`), som kalder `/api/mail-sync`.

**Miljøvariabler i Vercel:**

- `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API → service_role. Bypasser RLS, bruges kun server-side i denne ene route. Må aldrig eksponeres til klienten.
- `MAIL_SYNC_SECRET` — en tilfældig streng, delt med GitHub Actions-secret'en af samme navn. Godkender kald til `/api/mail-sync`.
- `MA_IMAP_USER` — valgfri, falder tilbage til `ma@mawebsolutions.dk` hvis udeladt.
- `MA_IMAP_PASSWORD` — adgangskoden til postkassen.

**GitHub repo secret** (Settings → Secrets and variables → Actions): `MAIL_SYNC_SECRET` med samme værdi som i Vercel.

**Driftsdetaljer værd at kende:**

- Første synkronisering for en postkasse henter de seneste 3 dages mail (ikke hele historikken), så mail sendt omkring opsætning ikke går tabt.
- Hver kørsel behandler højst 20 nye mails og gemmer fremskridt efter *hver enkelt* besked — ikke først når hele portionen er færdig. Det betyder at selv hvis en kørsel rammer Vercels tidsgrænse (60 sekunder på Hobby-planen), går intet arbejde tabt, og en eventuel pukkel af mails indhentes automatisk over et par 15-minutters-cyklusser.
- Tilføj en ekstra postkasse (fx `sales@`) ved at udvide `getConfiguredMailboxes()` i `app/api/mail-sync/route.ts` med endnu en konto og sin egen `*_IMAP_PASSWORD`-variabel.

## 7. Design og tilgængelighed

Farvetokens (canvas/surface/ink/accent/rust/gold/teal) defineres ét sted i `tailwind.config.ts` og bruges konsekvent — hele temaet kan ændres uden at røre en eneste sides indhold. Sekundær tekst holder minimum WCAG 2.1 AA-kontrast (4.5:1) mod baggrunden. Ikon-only knapper har `aria-label`. Layoutet er fuldt mobilvenligt med en off-canvas sidebar under `md`-breakpointet.

## 8. Forretningsregler håndhævet i databasen

Disse er bevidst lagt som constraints i migrationerne, ikke kun i UI, så de ikke kan omgås ved en fremtidig UI-fejl:

- Vedligeholdelsesaftaler: periode skal være 1, 2 eller 3 år (`period_years check`), fornyelsesdato beregnes automatisk (`generated always as`).
- Support er en selvstændig tabel med egen fakturastatus, adskilt fra vedligeholdelse.
- Status-felter (lead, projekt, support, aftale) er begrænset til faste værdisæt via `check`-constraints.

## Historik

Bygget i faser fra juli 2026: Fase 0 (auth-skelet) → Fase 1-3 (kernemoduler) → mail-integration → et fuldt redesign (mørkt tema, Kanban-boards, grafer, aktivitetslog) → mobilvenlighed → et teknisk review med opfølgende poleringsrunde (kontrast, tilgængelighed, sikkerhedsheaders, typede databaseforespørgsler). Se git-historikken for detaljer pr. commit.
