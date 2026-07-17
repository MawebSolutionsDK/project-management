import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.from("customers").select("*").order("name");
  const rows = data ?? [];

  const headers = ["Navn", "CVR", "Kontaktperson", "Email", "Telefon", "Branche", "Status", "Internt", "Noter", "Oprettet"];
  const lines = [headers.join(",")];

  for (const c of rows) {
    lines.push(
      [
        csvEscape(c.name),
        csvEscape(c.cvr),
        csvEscape(c.contact_person),
        csvEscape(c.email),
        csvEscape(c.phone),
        csvEscape(c.industry),
        csvEscape(c.status),
        csvEscape(c.is_internal ? "Ja" : "Nej"),
        csvEscape(c.notes),
        csvEscape(c.created_at),
      ].join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kunder.csv"',
    },
  });
}
