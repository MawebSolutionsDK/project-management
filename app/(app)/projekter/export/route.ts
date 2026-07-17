import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

type ProjectRow = Project & { customer: { name: string } | null };

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  const headers = [
    "Projektnavn",
    "Kunde",
    "Type",
    "Status",
    "Deadline",
    "Pris",
    "Fakturastatus",
    "Scope",
    "Noter",
    "Oprettet",
  ];
  const lines = [headers.join(",")];

  for (const p of rows as ProjectRow[]) {
    lines.push(
      [
        csvEscape(p.name),
        csvEscape(p.customer?.name),
        csvEscape(p.type),
        csvEscape(p.status),
        csvEscape(p.deadline),
        csvEscape(p.price),
        csvEscape(p.invoice_status),
        csvEscape(p.scope_description),
        csvEscape(p.notes),
        csvEscape(p.created_at),
      ].join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="projekter.csv"',
    },
  });
}
