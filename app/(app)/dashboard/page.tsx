import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Target,
  Briefcase,
  Wallet,
  LifeBuoy,
  Bell,
  Clock,
  Mail,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import {
  MrrGrowthChart,
  LeadsPerWeekChart,
} from "@/components/dashboard-charts";
import { createClient } from "@/lib/supabase/server";
import { daysUntil, relativeDayLabel } from "@/lib/dates";
import { buildPeriodSummaries, type PeriodStats } from "@/lib/summary";
import { buildActiveNotifications } from "@/lib/notifications";
import { buildMrrGrowth, buildNewLeadsPerWeek } from "@/lib/charts";

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
    unreadMailRes,
    activeAgreementsRes,
    notifications,
    recentCustomersRes,
    recentLeadsRes,
    recentProjectsRes,
    mrrGrowthData,
    leadsPerWeekData,
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("is_internal", false),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(vundet,tabt)"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(afsluttet,efter_service)"),
    supabase
      .from("support_cases")
      .select("*", { count: "exact", head: true })
      .eq("status", "aaben"),
    supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .or("matched_customer_id.not.is.null,matched_lead_id.not.is.null"),
    supabase
      .from("maintenance_agreements")
      .select(
        "id, monthly_price, renewal_date, plan_name, customer:customers(name)",
      )
      .eq("status", "aktiv"),
    buildActiveNotifications(supabase),
    supabase
      .from("customers")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("leads")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("projects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    buildMrrGrowth(supabase),
    buildNewLeadsPerWeek(supabase),
  ]);

  const activeAgreements = activeAgreementsRes.data ?? [];
  const mrr = activeAgreements.reduce(
    (sum, a: any) => sum + Number(a.monthly_price || 0),
    0,
  );

  const cards = [
    {
      href: "/kunder",
      label: "Kunder",
      value: customersRes.count ?? 0,
      icon: Users,
      trend:
        summaries.week.newCustomers > 0
          ? `+${summaries.week.newCustomers} denne uge`
          : null,
    },
    {
      href: "/leads",
      label: "Åbne leads",
      value: leadsCountRes.count ?? 0,
      icon: Target,
      trend:
        summaries.week.newLeads > 0
          ? `+${summaries.week.newLeads} denne uge`
          : null,
    },
    {
      href: "/projekter",
      label: "Aktive projekter",
      value: projectsCountRes.count ?? 0,
      icon: Briefcase,
      trend:
        summaries.week.newProjects > 0
          ? `+${summaries.week.newProjects} denne uge`
          : null,
    },
    {
      href: "/vedligeholdelse",
      label: "MRR",
      value: `${mrr.toLocaleString("da-DK")} kr.`,
      icon: Wallet,
      trend: null,
    },
    {
      href: "/support",
      label: "Åbne supportsager",
      value: openSupportRes.count ?? 0,
      icon: LifeBuoy,
      trend: null,
    },
    {
      href: "/mails?filter=unread",
      label: "Ulæste kunde-mails",
      value: unreadMailRes.count ?? 0,
      icon: Mail,
      trend: null,
    },
  ];

  const topNotifications = notifications.slice(0, 5);

  // ---- Seneste aktivitet ----
  const activity = [
    ...(recentCustomersRes.data ?? []).map((c) => ({
      label: `Ny kunde: ${c.name}`,
      href: `/kunder/${c.id}`,
      created_at: c.created_at,
    })),
    ...(recentLeadsRes.data ?? []).map((l) => ({
      label: `Nyt lead: ${l.name}`,
      href: `/leads/${l.id}`,
      created_at: l.created_at,
    })),
    ...(recentProjectsRes.data ?? []).map((p) => ({
      label: `Nyt projekt: ${p.name}`,
      href: `/projekter/${p.id}`,
      created_at: p.created_at,
    })),
  ]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 8);

  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">
        Velkommen, {user?.email}
      </h1>
      <p className="mt-1 text-sm text-ink/55">
        Overblik over kunder, leads, projekter og drift.
      </p>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-wide text-ink/40">
        Nøgletal
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="card p-5 transition hover:border-accent/40"
            >
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm text-ink/55">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{c.value}</p>
              {c.trend && (
                <p className="mt-1.5 text-xs font-medium text-accent">
                  {c.trend}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-wide text-ink/40">
        Grafer
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink/75">MRR-tilvækst</h2>
          <p className="mt-0.5 text-xs text-ink/40">
            Kumuleret pris for aktive aftaler, efter deres startdato. Viser ikke
            opsigelser.
          </p>
          <div className="mt-3">
            <MrrGrowthChart data={mrrGrowthData} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink/75">
            Nye leads pr. uge
          </h2>
          <p className="mt-0.5 text-xs text-ink/40">Seneste 8 uger.</p>
          <div className="mt-3">
            <LeadsPerWeekChart data={leadsPerWeekData} />
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-wide text-ink/40">
        Periode-oversigt
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                  <li
                    key={rowLabel}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink/55">{rowLabel}</span>
                    <span className="font-medium text-ink">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-wide text-ink/40">
        Kræver din opmærksomhed
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink/75">
              <Bell className="h-4 w-4 text-accent" />
              Notifikationer
            </h2>
            {notifications.length > 0 && (
              <span className="text-xs text-ink/40">
                {notifications.length} i alt
              </span>
            )}
          </div>
          {topNotifications.length === 0 ? (
            <p className="mt-2 text-sm text-ink/40">
              Intet der kræver din opmærksomhed lige nu.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {topNotifications.map((n) => (
                <li
                  key={n.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <Link
                    href={n.href}
                    className="truncate text-ink/80 hover:underline"
                  >
                    {n.message}
                  </Link>
                  <StatusBadge tone={n.tone}>
                    {relativeDayLabel(daysUntil(n.date))}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
          <Link href="/notifikationer" className="link-muted mt-3 inline-block">
            Se alle notifikationer
          </Link>
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
    </>
  );
}
