import Link from "next/link";
import AppNav from "@/components/app-nav";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { agreementStatusLabels, agreementStatusTones } from "@/lib/types";

export default async function VedligeholdelsePage() {
  const supabase = createClient();
  const { data: agreements } = await supabase
    .from("maintenance_agreements")
    .select("*, customer:customers(name)")
    .order("renewal_date", { ascending: true });

  return (
    <>
      <AppNav current="/vedligeholdelse" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Vedligeholdelsesaftaler</h1>
            <p className="mt-1 text-sm text-ink/55">Hosting- og vedligeholdelsesabonnementer, adskilt fra support.</p>
          </div>
          <Link href="/vedligeholdelse/ny" className="btn-primary">
            + Ny aftale
          </Link>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Kunde</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Pris/md</th>
                <th className="px-5 py-3">Fornyes</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(agreements ?? []).map((a: any) => (
                <tr key={a.id} className="border-t border-line/70 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/vedligeholdelse/${a.id}`} className="font-medium text-ink hover:underline">
                      {a.customer?.name ?? "–"}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/65">{a.plan_name}</td>
                  <td className="px-5 py-3 text-ink/65">{Number(a.monthly_price).toLocaleString("da-DK")} kr.</td>
                  <td className="px-5 py-3 text-ink/65">{a.renewal_date}</td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={agreementStatusTones[a.status as keyof typeof agreementStatusTones]}>
                      {agreementStatusLabels[a.status as keyof typeof agreementStatusLabels] ?? a.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {(agreements ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                    Ingen aftaler endnu.
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
