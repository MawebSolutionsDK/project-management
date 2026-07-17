import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/avatar";
import { TableSearch } from "@/components/table-search";
import { RowActions } from "@/components/row-actions";
import { createClient } from "@/lib/supabase/server";
import {
  agreementStatusLabels,
  agreementStatusTones,
  type MaintenanceAgreement,
} from "@/lib/types";

type AgreementRow = MaintenanceAgreement & {
  customer: { name: string } | null;
};
import { deleteAgreement } from "./actions";

export default async function VedligeholdelsePage() {
  const supabase = createClient();
  const { data: agreements } = await supabase
    .from("maintenance_agreements")
    .select("*, customer:customers(name)")
    .order("renewal_date", { ascending: true });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <RefreshCw className="h-6 w-6 text-accent" />
            Vedligeholdelsesaftaler
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Hosting- og vedligeholdelsesabonnementer, adskilt fra support.
          </p>
        </div>
        <Link href="/vedligeholdelse/ny" className="btn-primary gap-1.5">
          <Plus className="h-4 w-4" />
          Ny aftale
        </Link>
      </div>

      <div className="mb-3">
        <TableSearch placeholder="Søg aftaler..." />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-5 py-3">Kunde</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Pris/md</th>
              <th className="px-5 py-3">Fornyes</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {((agreements ?? []) as AgreementRow[]).map((a) => (
              <tr
                key={a.id}
                data-search-row={`${a.customer?.name ?? ""} ${a.plan_name}`}
                className="group border-t border-line/70 hover:bg-ink/[0.02]"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.customer?.name ?? "?"} size="sm" />
                    <Link
                      href={`/vedligeholdelse/${a.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {a.customer?.name ?? "–"}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink/65">{a.plan_name}</td>
                <td className="px-5 py-3 text-ink/65">
                  {Number(a.monthly_price).toLocaleString("da-DK")} kr.
                </td>
                <td className="px-5 py-3 text-ink/65">{a.renewal_date}</td>
                <td className="px-5 py-3">
                  <StatusBadge
                    tone={
                      agreementStatusTones[
                        a.status as keyof typeof agreementStatusTones
                      ]
                    }
                  >
                    {agreementStatusLabels[
                      a.status as keyof typeof agreementStatusLabels
                    ] ?? a.status}
                  </StatusBadge>
                </td>
                <td className="px-5 py-3">
                  <RowActions
                    editHref={`/vedligeholdelse/${a.id}`}
                    deleteAction={deleteAgreement.bind(null, a.id)}
                  />
                </td>
              </tr>
            ))}
            {(agreements ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink/55">
                  Ingen aftaler endnu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
