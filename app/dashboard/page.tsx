import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Target, Briefcase, Wallet, LifeBuoy, CalendarClock } from "lucide-react";
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

  const in60Days = new Date();
  in60Days.setDate(in60Days.getDate() + 60);
  const in60DaysStr = in60Days.toISOString().slice(0, 10);

  const [customersRes, leadsRes, projectsRes, openSupportRes, activeAgreementsRes] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("is_internal", false),
    supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "in", "(vundet,tabt)"),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("status", "in", "(afsluttet,efter_service)"),
    supabase.from("support_cases").select("*", { count: "exact", head: true }).eq("status", "aaben"),
    supabase
      .from("maintenance_agreements")
      .select("monthly_price, renewal_date, plan_name, customer:customers(name)")
      .eq("status", "aktiv"),
  ]);

  const activeAgreements = activeAgreementsRes.data ?? [];
  const mrr = activeAgreements.reduce((sum, a: any) => sum + Number(a.monthly_price || 0), 0);
  const upcomingRenewals = activeAgreements
    .filter((a: any) => a.renewal_date && a.renewal_date <= in60DaysStr)
    .sort((a: any, b: any) => (a.renewal_date > b.renewal_date ? 1 : -1))
    .slice(0, 5);

  const cards = [
    { href: "/kunder", label: "Kunder", value: customersRes.count ?? 0, icon: Users },
    { href: "/leads", label: "Åbne leads", value: leadsRes.count ?? 0, icon: Target },
    { href: "/projekter", label: "Aktive projekter", value: projectsRes.count ?? 0, icon: Briefcase },
    { href: "/vedligeholdelse", label: "MRR", value: `${mrr.toLocaleString("da-DK")} kr.`, icon: Wallet },
    { href: "/support", label: "Åbne supportsager", value: openSupportRes.count ?? 0, icon: LifeBuoy },
  ];

  return (
    <>
      <AppNav current="/dashboard" />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">Velkommen, {user?.email}</h1>
        <p className="mt-1 text-sm text-ink/55">Overblik over kunder, leads, projekter og drift.</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.href} href={c.href} className="card p-5 transition hover:border-accent/40">
                <Icon className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm text-ink/55">{c.label}</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{c.value}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink/75">
            <CalendarClock className="h-4 w-4 text-accent" />
            Fornyelser inden for 60 dage
          </h2>
          {upcomingRenewals.length === 0 ? (
            <p className="mt-2 text-sm text-ink/40">Ingen aftaler skal fornyes lige nu.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcomingRenewals.map((a: any, i: number) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-ink/80">
                    {a.customer?.name ?? "–"} <span className="text-ink/40">· {a.plan_name}</span>
                  </span>
                  <span className="text-ink/55">{a.renewal_date}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/vedligeholdelse" className="link-muted mt-3 inline-block">
            Se alle aftaler
          </Link>
        </div>
      </main>
    </>
  );
}
