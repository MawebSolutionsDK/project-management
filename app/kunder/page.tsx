import Link from "next/link";
import { Plus, Users, Download } from "lucide-react";
import AppNav from "@/components/app-nav";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { customerStatusLabels, customerStatusTones } from "@/lib/types";

export default async function KunderPage() {
  const supabase = createClient();
  const { data: customers } = await supabase.from("customers").select("*").order("name");

  return (
    <>
      <AppNav current="/kunder" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <Users className="h-6 w-6 text-accent" />
              Kunder
            </h1>
            <p className="mt-1 text-sm text-ink/55">Alle kunder, inkl. interne projekter.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/kunder/export" className="btn-secondary gap-1.5">
              <Download className="h-4 w-4" />
              Eksportér CSV
            </a>
            <Link href="/kunder/ny" className="btn-primary gap-1.5">
              <Plus className="h-4 w-4" />
              Ny kunde
            </Link>
          </div>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Navn</th>
                <th className="px-5 py-3">Branche</th>
                <th className="px-5 py-3">Kontakt</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(customers ?? []).map((c) => (
                <tr key={c.id} className="border-t border-line/70 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/kunder/${c.id}`} className="font-medium text-ink hover:underline">
                      {c.name}
                    </Link>
                    {c.is_internal && (
                      <span className="ml-2 rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-medium text-ink/60">
                        Internt
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink/65">{c.industry ?? "–"}</td>
                  <td className="px-5 py-3 text-ink/65">{c.contact_person ?? c.email ?? "–"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={customerStatusTones[c.status as keyof typeof customerStatusTones]}>
                      {customerStatusLabels[c.status as keyof typeof customerStatusLabels] ?? c.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {(customers ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink/40">
                    Ingen kunder endnu.
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
