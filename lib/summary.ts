import type { SupabaseClient } from "@supabase/supabase-js";

export interface PeriodStats {
  newLeads: number;
  leadsWon: number;
  newCustomers: number;
  newProjects: number;
  projectsCompleted: number;
  supportResolved: number;
  supportHours: number;
  invoicedAmount: number;
  upcomingRenewals: number;
}

export interface PeriodSummaries {
  day: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
}

export async function buildPeriodSummaries(supabase: SupabaseClient): Promise<PeriodSummaries> {
  const [leadsRes, customersRes, projectsRes, supportRes, agreementsRes, expensesRes] = await Promise.all([
    supabase.from("leads").select("id, status, created_at, updated_at"),
    supabase.from("customers").select("id, created_at").eq("is_internal", false),
    supabase.from("projects").select("id, status, price, invoice_status, created_at, updated_at"),
    supabase.from("support_cases").select("id, status, hours_spent, updated_at"),
    supabase.from("maintenance_agreements").select("id, renewal_date").eq("status", "aktiv"),
    supabase.from("business_expenses").select("id, renewal_date").not("renewal_date", "is", null),
  ]);

  const leads = leadsRes.data ?? [];
  const customers = customersRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const supportCases = supportRes.data ?? [];
  const agreements = agreementsRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayStr = todayStart.toISOString().slice(0, 10);

  function periodStats(days: number): PeriodStats {
    const cutoff = new Date(todayStart);
    cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
    const cutoffStr = cutoff.toISOString();

    const forwardEnd = new Date(todayStart);
    forwardEnd.setUTCDate(forwardEnd.getUTCDate() + (days - 1));
    const forwardEndStr = forwardEnd.toISOString().slice(0, 10);

    const newLeads = leads.filter((l) => l.created_at >= cutoffStr).length;
    const leadsWon = leads.filter((l) => l.status === "vundet" && l.updated_at >= cutoffStr).length;
    const newCustomers = customers.filter((c) => c.created_at >= cutoffStr).length;
    const newProjects = projects.filter((p) => p.created_at >= cutoffStr).length;
    const projectsCompleted = projects.filter((p) => p.status === "afsluttet" && p.updated_at >= cutoffStr).length;
    const invoicedAmount = projects
      .filter((p) => ["faktureret", "betalt"].includes(p.invoice_status) && p.updated_at >= cutoffStr)
      .reduce((sum, p) => sum + Number(p.price || 0), 0);

    const resolvedCases = supportCases.filter((s) => s.status === "loest" && s.updated_at >= cutoffStr);
    const supportResolved = resolvedCases.length;
    const supportHours = resolvedCases.reduce((sum, s) => sum + Number(s.hours_spent || 0), 0);

    const upcomingRenewals =
      agreements.filter((a) => a.renewal_date >= todayStr && a.renewal_date <= forwardEndStr).length +
      expenses.filter((e) => e.renewal_date && e.renewal_date >= todayStr && e.renewal_date <= forwardEndStr).length;

    return {
      newLeads,
      leadsWon,
      newCustomers,
      newProjects,
      projectsCompleted,
      supportResolved,
      supportHours,
      invoicedAmount,
      upcomingRenewals,
    };
  }

  return {
    day: periodStats(1),
    week: periodStats(7),
    month: periodStats(30),
  };
}
