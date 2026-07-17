import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Enkel ilike-baseret global søgning på tværs af de moduler der har et navn/titel-felt.
// Kører med brugerens egen session (RLS gælder som normalt) - ingen service-role her,
// da søgning altid sker på vegne af en logget ind bruger.
const SEARCH_TARGETS = [
  { table: "customers", column: "name", label: "Kunde", hrefPrefix: "/kunder" },
  { table: "leads", column: "name", label: "Lead", hrefPrefix: "/leads" },
  {
    table: "projects",
    column: "name",
    label: "Projekt",
    hrefPrefix: "/projekter",
  },
  {
    table: "support_cases",
    column: "title",
    label: "Supportsag",
    hrefPrefix: "/support",
  },
  {
    table: "products",
    column: "name",
    label: "Produkt",
    hrefPrefix: "/produkter",
  },
  {
    table: "maintenance_agreements",
    column: "plan_name",
    label: "Aftale",
    hrefPrefix: "/vedligeholdelse",
  },
  {
    table: "business_expenses",
    column: "name",
    label: "Udgift",
    hrefPrefix: "/udgifter",
  },
] as const;

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const grouped = await Promise.all(
    SEARCH_TARGETS.map(async (target) => {
      const { data } = await supabase
        .from(target.table)
        .select(`id, ${target.column}`)
        .ilike(target.column, `%${q}%`)
        .limit(5);

      return (data ?? []).map((row: any) => ({
        id: row.id as string,
        label: row[target.column] as string,
        group: target.label,
        href: `${target.hrefPrefix}/${row.id}`,
      }));
    }),
  );

  return NextResponse.json({ results: grouped.flat() });
}
