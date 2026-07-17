import Link from "next/link";
import { Plus, LifeBuoy } from "lucide-react";
import AppNav from "@/components/app-nav";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { supportStatusLabels, supportStatusTones, invoiceStatusLabels, invoiceStatusTones } from "@/lib/types";

export default async function SupportPage() {
  const supabase = createClient();
  const { data: cases } = await supabase
    .from("support_cases")
    .select("*, customer:customers(name)")
    .order("opened_at", { ascending: false });

  return (
    <>
      <AppNav current="/support" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <LifeBuoy className="h-6 w-6 text-accent" />
              Support
            </h1>
            <p className="mt-1 text-sm text-ink/55">Supportsager, solgt separat fra vedligeholdelse.</p>
          </div>
          <Link href="/support/ny" className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            Ny sag
          </Link>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Sag</th>
                <th className="px-5 py-3">Kunde</th>
                <th className="px-5 py-3">Timer</th>
                <th className="px-5 py-3">Faktura</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(cases ?? []).map((s: any) => (
                <tr key={s.id} className="border-t border-line/70 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/support/${s.id}`} className="font-medium text-ink hover:underline">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/65">{s.customer?.name ?? "–"}</td>
                  <td className="px-5 py-3 text-ink/65">{s.hours_spent ?? "–"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={invoiceStatusTones[s.invoice_status as keyof typeof invoiceStatusTones]}>
                      {invoiceStatusLabels[s.invoice_status as keyof typeof invoiceStatusLabels] ?? s.invoice_status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={supportStatusTones[s.status as keyof typeof supportStatusTones]}>
                      {supportStatusLabels[s.status as keyof typeof supportStatusLabels] ?? s.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {(cases ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                    Ingen supportsager endnu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
