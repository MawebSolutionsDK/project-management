import type { SupabaseClient } from "@supabase/supabase-js";
import { daysUntil } from "@/lib/dates";

export type NotificationTone = "danger" | "warning" | "info";

export type Notification = {
  key: string;
  date: string;
  message: string;
  tone: NotificationTone;
  href: string;
};

// Notifikationer er afledt af eksisterende data (ingen egen "notifikation"-tabel) - se
// Kunder/Leads/Vedligeholdelse/Udgifter for de underliggende datoer. Hver notifikation får
// en stabil nøgle der inkluderer selve datoen (fx "lead:<id>:2026-08-01"), så en "markér
// som set" kun dækker den konkrete dato: ændres datoen senere (fx udskudt opfølgning),
// dukker en ny notifikation med en anden nøgle naturligt op igen uden ekstra bogføring.
type DismissedRow = { key: string };
type LeadRow = {
  id: string;
  name: string;
  next_action: string | null;
  next_action_date: string;
};
type ProjectRow = { id: string; name: string; deadline: string };
type AgreementRow = {
  id: string;
  plan_name: string;
  renewal_date: string;
  customer: { name: string } | null;
};
type ExpenseRow = { id: string; name: string; renewal_date: string };

export async function buildActiveNotifications(
  supabase: SupabaseClient,
): Promise<Notification[]> {
  const [dismissedRes, leadsRes, projectsRes, agreementsRes, expensesRes] =
    await Promise.all([
      supabase.from("dismissed_notifications").select("key"),
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
      supabase
        .from("maintenance_agreements")
        .select("id, plan_name, renewal_date, customer:customers(name)")
        .eq("status", "aktiv"),
      supabase
        .from("business_expenses")
        .select("id, name, renewal_date")
        .not("renewal_date", "is", null),
    ]);

  const dismissedKeys = new Set(
    ((dismissedRes.data ?? []) as DismissedRow[]).map((d) => d.key),
  );
  const notifications: Notification[] = [];

  for (const lead of (leadsRes.data ?? []) as LeadRow[]) {
    if (!lead.next_action_date) continue;
    const d = daysUntil(lead.next_action_date);
    const key = `lead:${lead.id}:${lead.next_action_date}`;
    if (d < 0) {
      notifications.push({
        key,
        date: lead.next_action_date,
        message: `Forsinket opfølgning: ${lead.name}`,
        tone: "danger",
        href: `/leads/${lead.id}`,
      });
    } else if (d <= 7) {
      notifications.push({
        key,
        date: lead.next_action_date,
        message: `Opfølgning: ${lead.name}${lead.next_action ? ` – ${lead.next_action}` : ""}`,
        tone: "warning",
        href: `/leads/${lead.id}`,
      });
    }
  }

  for (const project of (projectsRes.data ?? []) as ProjectRow[]) {
    if (!project.deadline) continue;
    const d = daysUntil(project.deadline);
    const key = `project:${project.id}:${project.deadline}`;
    if (d < 0) {
      notifications.push({
        key,
        date: project.deadline,
        message: `Deadline overskredet: ${project.name}`,
        tone: "danger",
        href: `/projekter/${project.id}`,
      });
    } else if (d <= 14) {
      notifications.push({
        key,
        date: project.deadline,
        message: `Deadline: ${project.name}`,
        tone: "warning",
        href: `/projekter/${project.id}`,
      });
    }
  }

  for (const agreement of (agreementsRes.data ??
    []) as unknown as AgreementRow[]) {
    if (!agreement.renewal_date) continue;
    const d = daysUntil(agreement.renewal_date);
    const key = `agreement:${agreement.id}:${agreement.renewal_date}`;
    if (d < 0) {
      notifications.push({
        key,
        date: agreement.renewal_date,
        message: `Aftale skulle være fornyet: ${agreement.customer?.name ?? "–"} · ${agreement.plan_name}`,
        tone: "danger",
        href: `/vedligeholdelse/${agreement.id}`,
      });
    } else if (d <= 60) {
      notifications.push({
        key,
        date: agreement.renewal_date,
        message: `Aftale fornyes: ${agreement.customer?.name ?? "–"} · ${agreement.plan_name}`,
        tone: d <= 14 ? "warning" : "info",
        href: `/vedligeholdelse/${agreement.id}`,
      });
    }
  }

  for (const expense of (expensesRes.data ?? []) as ExpenseRow[]) {
    if (!expense.renewal_date) continue;
    const d = daysUntil(expense.renewal_date);
    const key = `expense:${expense.id}:${expense.renewal_date}`;
    if (d < 0) {
      notifications.push({
        key,
        date: expense.renewal_date,
        message: `Udgift skulle være fornyet: ${expense.name}`,
        tone: "danger",
        href: `/udgifter/${expense.id}`,
      });
    } else if (d <= 30) {
      notifications.push({
        key,
        date: expense.renewal_date,
        message: `Udgift fornyes: ${expense.name}`,
        tone: "warning",
        href: `/udgifter/${expense.id}`,
      });
    }
  }

  return notifications
    .filter((n) => !dismissedKeys.has(n.key))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}
