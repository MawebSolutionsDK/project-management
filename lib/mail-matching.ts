import type { SupabaseClient } from "@supabase/supabase-js";

// Delt matching-logik mellem mail-sync (service-role klient) og manuelle
// server actions (bruger-session klient) - se app/api/mail-sync/route.ts og
// app/mails/actions.ts. Begge klienter er strukturelt kompatible med
// SupabaseClient (samme .from()/.select()/.ilike()-API), så den fælles type
// bruges her i stedet for `any`.

// Almindelige gratis mail-udbydere - domænematch her ville give falske positiver
// (mange forskellige kunder/leads kan sagtens dele "gmail.com" osv).
export const FREEMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "me.com",
  "msn.com",
  "aol.com",
  "protonmail.com",
]);

async function findMatchByAddress(
  supabase: SupabaseClient,
  table: "customers" | "leads",
  email: string,
) {
  const { data } = await supabase
    .from(table)
    .select("id")
    .ilike("email", email)
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

async function findMatchByDomain(
  supabase: SupabaseClient,
  table: "customers" | "leads",
  domain: string,
) {
  if (FREEMAIL_DOMAINS.has(domain)) return null;
  const { data } = await supabase
    .from(table)
    .select("id")
    .ilike("email", `%@${domain}`)
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

export async function findMatch(
  supabase: SupabaseClient,
  fromAddress: string,
): Promise<{ matchedCustomerId: string | null; matchedLeadId: string | null }> {
  let matchedCustomerId = await findMatchByAddress(
    supabase,
    "customers",
    fromAddress,
  );
  let matchedLeadId: string | null = null;
  if (!matchedCustomerId) {
    matchedLeadId = await findMatchByAddress(supabase, "leads", fromAddress);
  }

  if (!matchedCustomerId && !matchedLeadId) {
    const domain = fromAddress.split("@")[1];
    if (domain) {
      matchedCustomerId = await findMatchByDomain(
        supabase,
        "customers",
        domain,
      );
      if (!matchedCustomerId) {
        matchedLeadId = await findMatchByDomain(supabase, "leads", domain);
      }
    }
  }

  return { matchedCustomerId, matchedLeadId };
}
