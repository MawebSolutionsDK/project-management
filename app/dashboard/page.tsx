import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [customersRes, leadsRes, projectsRes] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("is_internal", false),
    supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "in", "(vundet,tabt)"),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("status", "in", "(afsluttet,efter_service)"),
  ]);

  const cards = [
    { href: "/kunder", label: "Kunder", value: customersRes.count ?? 0 },
    { href: "/leads", label: "Åbne leads", value: leadsRes.count ?? 0 },
    { href: "/projekter", label: "Aktive projekter", value: projectsRes.count ?? 0 },
  ];

  return (
    <>
      <AppNav current="/dashboard" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">Velkommen, {user?.email}</h1>
        <p className="mt-1 text-sm text-ink/55">Overblik over kunder, leads og projekter.</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="card p-5 transition hover:border-accent/40">
              <p className="text-sm text-ink/55">{c.label}</p>
              <p className="mt-1 text-3xl font-semibold text-ink">{c.value}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
