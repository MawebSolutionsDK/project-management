export type ActivityEvent = {
  key: string;
  label: string;
  href: string;
  type:
    | "customer"
    | "lead"
    | "project"
    | "support"
    | "agreement"
    | "product"
    | "expense";
  timestamp: string;
};

// Aktivitetslog er, ligesom notifikationer, afledt af eksisterende created_at/updated_at-felter
// på tværs af moduler - ingen ny "activity_log"-tabel. Dækker både oprettelser og et par
// centrale afslutnings-hændelser (lead vundet, projekt afsluttet, sag løst).
export async function buildActivityLog(
  supabase: any,
  limitPerModule = 100,
): Promise<ActivityEvent[]> {
  const [customers, leads, projects, support, agreements, products, expenses] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(limitPerModule),
      supabase
        .from("leads")
        .select("id, name, created_at, status, updated_at")
        .order("created_at", { ascending: false })
        .limit(limitPerModule),
      supabase
        .from("projects")
        .select("id, name, created_at, status, updated_at")
        .order("created_at", { ascending: false })
        .limit(limitPerModule),
      supabase
        .from("support_cases")
        .select("id, title, created_at, status, closed_at")
        .order("created_at", { ascending: false })
        .limit(limitPerModule),
      supabase
        .from("maintenance_agreements")
        .select("id, plan_name, created_at, customer:customers(name)")
        .order("created_at", { ascending: false })
        .limit(limitPerModule),
      supabase
        .from("products")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(limitPerModule),
      supabase
        .from("business_expenses")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(limitPerModule),
    ]);

  const events: ActivityEvent[] = [];

  for (const c of (customers.data ?? []) as any[]) {
    events.push({
      key: `customer-new-${c.id}`,
      label: `Ny kunde: ${c.name}`,
      href: `/kunder/${c.id}`,
      type: "customer",
      timestamp: c.created_at,
    });
  }
  for (const l of (leads.data ?? []) as any[]) {
    events.push({
      key: `lead-new-${l.id}`,
      label: `Nyt lead: ${l.name}`,
      href: `/leads/${l.id}`,
      type: "lead",
      timestamp: l.created_at,
    });
    if (l.status === "vundet" && l.updated_at) {
      events.push({
        key: `lead-won-${l.id}`,
        label: `Lead vundet: ${l.name}`,
        href: `/leads/${l.id}`,
        type: "lead",
        timestamp: l.updated_at,
      });
    }
  }
  for (const p of (projects.data ?? []) as any[]) {
    events.push({
      key: `project-new-${p.id}`,
      label: `Nyt projekt: ${p.name}`,
      href: `/projekter/${p.id}`,
      type: "project",
      timestamp: p.created_at,
    });
    if (p.status === "afsluttet" && p.updated_at) {
      events.push({
        key: `project-done-${p.id}`,
        label: `Projekt afsluttet: ${p.name}`,
        href: `/projekter/${p.id}`,
        type: "project",
        timestamp: p.updated_at,
      });
    }
  }
  for (const s of (support.data ?? []) as any[]) {
    events.push({
      key: `support-new-${s.id}`,
      label: `Ny supportsag: ${s.title}`,
      href: `/support/${s.id}`,
      type: "support",
      timestamp: s.created_at,
    });
    if (s.status === "loest" && s.closed_at) {
      events.push({
        key: `support-done-${s.id}`,
        label: `Supportsag løst: ${s.title}`,
        href: `/support/${s.id}`,
        type: "support",
        timestamp: s.closed_at,
      });
    }
  }
  for (const a of (agreements.data ?? []) as any[]) {
    events.push({
      key: `agreement-new-${a.id}`,
      label: `Ny aftale: ${a.customer?.name ?? "–"} · ${a.plan_name}`,
      href: `/vedligeholdelse/${a.id}`,
      type: "agreement",
      timestamp: a.created_at,
    });
  }
  for (const p of (products.data ?? []) as any[]) {
    events.push({
      key: `product-new-${p.id}`,
      label: `Nyt produkt: ${p.name}`,
      href: `/produkter/${p.id}`,
      type: "product",
      timestamp: p.created_at,
    });
  }
  for (const e of (expenses.data ?? []) as any[]) {
    events.push({
      key: `expense-new-${e.id}`,
      label: `Ny udgift: ${e.name}`,
      href: `/udgifter/${e.id}`,
      type: "expense",
      timestamp: e.created_at,
    });
  }

  return events
    .filter((e) => e.timestamp)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
