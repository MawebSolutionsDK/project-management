# Maweb Solutions – Internt system

Internt projektstyringssystem (kunder, projekter, leads, support, vedligeholdelse).
Denne commit er **Fase 0**: kun login + tomt dashboard. Datamodulerne kommer i Fase 1.

## Stack
- Next.js 14 (App Router) + TypeScript
- Supabase (Auth) via `@supabase/ssr`
- Tailwind CSS
- Deploy: Vercel (gratis Hobby-plan)
- Domæne: `system.mawebsolutions.dk` (DNS hos Simply.com)

## 1. Miljøvariabler
Kopiér `.env.example` til `.env.local` og udfyld med værdier fra Supabase:
Supabase Dashboard → dit projekt → Project Settings → API.

```
NEXT_PUBLIC_SUPABASE_URL=https://trjuqgpmbnjvptwtvyon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>
```

## 2. Opret admin-bruger i Supabase (kun én, ingen offentlig sign-up)
1. Supabase Dashboard → Authentication → Users → **Add user** → indtast din email + en adgangskode.
2. Supabase Dashboard → Authentication → Providers → Email → sluk **"Allow new users to sign up"**.
   Så er det kun den bruger, du selv har oprettet, der kan logge ind — ingen kan selv oprette en konto.

## 3. Lokal udvikling (valgfrit)
```
npm install
npm run dev
```

## 4. Deploy til Vercel
1. Opret et projekt på vercel.com → Import Git Repository → vælg `MawebSolutionsDK/project-management`.
2. Under Environment Variables: tilføj `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY` (samme værdier som i `.env.local`).
3. Deploy.

## 5. Tilføj domæne
1. Vercel-projektet → Settings → Domains → tilføj `system.mawebsolutions.dk`.
2. Vercel viser en CNAME-værdi (typisk `cname.vercel-dns.com`).
3. Simply.com → DNS-administration for `mawebsolutions.dk` → tilføj en **CNAME record**:
   - Navn/host: `system`
   - Værdi: den CNAME Vercel viste
4. Vent på DNS-propagering (typisk minutter til et par timer), Vercel markerer domænet som "Valid" når det virker.

## 6. Test
Besøg `system.mawebsolutions.dk` → skal vise login-siden.
Log ind med den bruger, du oprettede i trin 2 → skal vise dashboard-placeholderen.

## Næste fase
Fase 1: Kunder, Projekter og Leads som rigtige datamoduler (databasetabeller + lister/formularer).

## Mail-integration (ma@mawebsolutions.dk)

Overvåger indboksen via IMAP (mail.simply.com, port 143 + STARTTLS) hvert 15. minut via en GitHub Actions-workflow,
matcher afsendere mod kunder/leads, og logger dem i `emails`-tabellen. Ingen mailtekst gemmes, kun afsender/emne/dato.

**Miljøvariabler i Vercel (Project Settings -> Environment Variables):**
- `SUPABASE_SERVICE_ROLE_KEY` - fra Supabase -> Project Settings -> API -> service_role (bypasser RLS, kun brugt server-side i /api/mail-sync)
- `MAIL_SYNC_SECRET` - en tilfældig streng, delt med GitHub Actions-secret'en af samme navn, bruges til at godkende kald til /api/mail-sync
- `MA_IMAP_PASSWORD` - adgangskoden til ma@mawebsolutions.dk

**GitHub repo secret (Settings -> Secrets and variables -> Actions):**
- `MAIL_SYNC_SECRET` - samme værdi som i Vercel

Første gang synkroniseringen kører for en postkasse, importeres intet - den "starter fra nu" og henter kun nye mails
derefter, for ikke at importere hele mailhistorikken.

Tilføj sales@ eller info@ senere ved at udvide `getConfiguredMailboxes()` i `app/api/mail-sync/route.ts` med endnu
en konto, tilknyttet sin egen `*_IMAP_PASSWORD`-miljøvariabel.
