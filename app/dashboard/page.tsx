import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Target, Briefcase, Wallet, LifeBuoy, Bell, Clock } from "lucide-react";
import AppNav from "@/components/app-nav";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { daysUntil, relativeDayLabel } from "@/lib/dates";
import { buildPeriodSummaries, type PeriodStats } from "@/lib/summary";

type Notification = {
  date: string;
  message: string;
  tone: "danger" | "warning" | "info";
  href: string;
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const summaries = await buildPeriodSummaries(supabase);

  const [
    customersRes,
    leadsCountRes,
    projectsCountRes,
    openSupportRes,
    activeAgreementsRes,
    leadsForNotifRes,
    projectsForNotifRes,
    expensesForNotifRes,
    recentCustomersRes,
    recentLeadsRes,
    recentProjectsRes,
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("is_internal", false),
    supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "in", "(vundet,tabt)"),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("status", "in", "(afsluttet,efter_service)"),
    supabase.from("support_cases").select("*", { count: "exact", head: true }).eq("status", "aaben"),
    supabase
      .from("maintenance_agreements")
      .select("id, monthly_price, renewal_date, plan_name, customer:customers(name)")
      .eq("status", "aktiv"),
    supabase
      .from("leads")
      .select("id, name, next_action, next_action_date")
      .not("status", "in", "(vundet,tabt)")
      .not("next_action_date", "is", null),
    supabase
      .from("projects")
      .select("id, name, deadline")
      .not("status", "in", "(afsluttet,efter_service)")
      .not("deadline", "is", null),
    supabase.from("business_expenses").select("id, name, renewal_date").not("renewal_date", "is", null),
    supabase.from("customers").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("leads").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("projects").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const activeAgreements = activeAgreementsRes.data ?? [];
  const mrr = activeAgreements.reduce((sum, a: any) => sum + Number(a.monthly_price || 0), 0);

  const cards = [
    { href: "/kunder", label: "Kunder", value: customersRes.count ?? 0, icon: Users },
    { href: "/leads", label: "Åbne leads", value: leadsCountRes.count ?? 0, icon: Target },
    { href: "/projekter", label: "Aktive projekter", value: projectsCountRes.count ?? 0, icon: Briefcase },
    { href: "/vedligeholdelse", label: "MRR", value: `${mrr.toLocaleString("da-DK")} kr.`, icon: Wallet },
    { href: "/support", label: "Åbne supportsager", value: openSupportRes.count ?? 0, icon: LifeBuoy },
  ];

  // ---- Notifikationer ----
  const notifications: Notification[] = [];

  for (const lead of leadsForNotifRes.data ?? []) {
    if (!lead.next_action_date) continue;
    const d = daysUntil(lead.next_action_date);
    if (d < 0) {
      notifications.push({
        date: lead.next_action_date,
        message: `Forsinket opfølgning: ${lead.name}`,
        tone: "danger",
        href: `/leads/${lead.id}`,
      });
    } else if (d <= 7) {
      notifications.push({
        date: lead.next_action_date,
        message: `Opfølgning: ${lead.name}${lead.next_action ? ` – ${lead.next_action}` : ""}`,
        tone: "warning",
        href: `/leads/${lead.id}`,
      });
    }
  }

  for (const project of projectsForNotifRes.data ?? []) {
    if (!project.deadline) continue;
    const d = daysUntil(project.deadline);
    if (d < 0) {
      notifications.push({
        date: project.deadline,
        message: `Deadline overskredet: ${project.name}`,
        tone: "danger",
        href: `/projekter/${project.id}`,
      });
    } else if (d <= 14) {
      notifications.push({
        date: project.deadline,
        message: `Deadline: ${project.name}`,
        tone: "warning",
        href: `/projekter/${project.id}`,
      });
    }
  }

  for (const agreement of activeAgreements as any[]) {
    if (!agreement.renewal_date) continue;
    const d = daysUntil(agreement.renewal_date);
    if (d < 0) {
      notifications.push({
        date: agreement.renewal_date,
        message: `Aftale skulle være fornyet: ${agreement.customer?.name ?? "–"} · ${agreement.plan_name}`,
        tone: "danger",
        href: `/vedligeholdelse/${agreement.id}`,
      });
    } else if (d <= 60) {
      notifications.push({
        date: agreement.renewal_date,
        message: `Aftale fornyes: ${agreement.customer?.name ?? "–"} · ${agreement.plan_name}`,
        tone: d <= 14 ? "warning" : "info",
        href: `/vedligeholdelse/${agreement.id}`,
      });
    }
  }

  for (const expense of expensesForNotifRes.data ?? []) {
    if (!expense.renewal_date) continue;
    const d = daysUntil(expense.renewal_date);
    if (d < 0) {
      notifications.push({
        date: expense.renewal_date,
        message: `Udgift skulle være fornyet: ${expense.name}`,
        tone: "danger",
        href: `/udgifter/${expense.id}`,
      });
    } else if (d <= 30) {
      notifications.push({
        date: expense.renewal_date,
        message: `Udgift fornyes: ${expense.name}`,
        tone: "warning",
        href: `/udgifter/${expense.id}`,
      });
    }
  }

  notifications.sort((a, b) => (a.date > b.date ? 1 : -1));
  const topNotifications = notifications.slice(0, 8);

  // ---- Seneste aktivitet ----
  const activity = [
    ...(recentCustomersRes.data ?? []).map((c) => ({ label: `Ny kunde: ${c.name}`, href: `/kunder/${c.id}`, created_at: c.created_at })),
    ...(recentLeadsRes.data ?? []).map((l) => ({ label: `Nyt lead: ${l.name}`, href: `/leads/${l.id}`, created_at: l.created_at })),
    ...(recentProjectsRes.data ?? []).map((p) => ({ label: `Nyt projekt: ${p.name}`, href: `/projekter/${p.id}`, created_at: p.created_at })),
  ]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 8);

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

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {(
            [
              { key: "day", label: "I dag" },
              { key: "week", label: "Seneste 7 dage" },
              { key: "month", label: "Seneste 30 dage" },
            ] as const
          ).map(({ key, label }) => {
            const s: PeriodStats = summaries[key];
            const rows: [string, string | number][] = [
              ["Nye leads", s.newLeads],
              ["Leads vundet", s.leadsWon],
              ["Nye kunder", s.newCustomers],
              ["Nye projekter", s.newProjects],
              ["Projekter afsluttet", s.projectsCompleted],
              ["Support løst", `${s.supportResolved} (${s.supportHours} t)`],
              ["Faktureret", `${s.invoicedAmount.toLocaleString("da-DK")} kr.`],
              ["Fornyelser i perioden", s.upcomingRenewals],
            ];
            return (
              <div key={key} className="card p-5">
                <h2 className="text-sm font-semibold text-ink/75">{label}</h2>
                <ul className="mt-3 space-y-1.5">
                  {rows.map(([rowLabel, value]) => (
                    <li key={rowLabel} className="flex items-center justify-between text-sm">
                      <span className="text-ink/55">{rowLabel}</span>
                      <span className="font-medium text-ink">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink/75">
              <Bell className="h-4 w-4 text-accent" />
              Notifikationer
            </h2>
            {topNotifications.length === 0 ? (
              <p className="mt-2 text-sm text-ink/40">Intet der kræver din opmærksomhed lige nu.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {topNotifications.map((n, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-sm">
                    <Link href={n.href} className="truncate text-ink/80 hover:underline">
                      {n.message}
                    </Link>
                    <StatusBadge tone={n.tone}>{relativeDayLabel(daysUntil(n.date))}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink/75">
              <Clock className="h-4 w-4 text-accent" />
              Seneste aktivitet
            </h2>
            {activity.length === 0 ? (
              <p className="mt-2 text-sm text-ink/40">Ingen aktivitet endnu.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {activity.map((a, i) => (
                  <li key={i} className="text-sm">
                    <Link href={a.href} className="text-ink/80 hover:underline">
                      {a.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
