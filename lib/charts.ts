export type ChartPoint = { label: string; value: number };

// MRR-tilvækst ud fra hvornår aktive aftaler startede (kumuleret sum af monthly_price pr.
// måned, ordnet efter start_date). Dette er IKKE en fuld historisk MRR-graf med churn
// (vi tracker ikke opsigelsesdato), men en ærlig graf over hvor meget nuværende aktiv MRR
// stammer fra hvornår - stiger kun, falder aldrig, og det er bevidst tydeliggjort i UI-teksten.
export async function buildMrrGrowth(supabase: any): Promise<ChartPoint[]> {
  const { data } = await supabase
    .from("maintenance_agreements")
    .select("monthly_price, start_date")
    .eq("status", "aktiv")
    .not("start_date", "is", null);

  const rows = (data ?? []) as { monthly_price: number; start_date: string }[];
  if (rows.length === 0) return [];

  const buckets = new Map<string, number>();
  for (const r of rows) {
    const month = r.start_date.slice(0, 7);
    buckets.set(month, (buckets.get(month) ?? 0) + Number(r.monthly_price));
  }

  const months = Array.from(buckets.keys()).sort();
  const [startY, startM] = months[0].split("-").map(Number);
  const now = new Date();
  const endY = now.getFullYear();
  const endM = now.getMonth() + 1;

  const allMonths: string[] = [];
  let y = startY;
  let m = startM;
  while (y < endY || (y === endY && m <= endM)) {
    allMonths.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  let cumulative = 0;
  return allMonths.map((month) => {
    cumulative += buckets.get(month) ?? 0;
    const [yy, mm] = month.split("-").map(Number);
    const label = new Date(yy, mm - 1, 1).toLocaleDateString("da-DK", {
      month: "short",
      year: "2-digit",
    });
    return { label, value: cumulative };
  });
}

// Nye leads pr. uge, seneste N uger (default 8) - talt direkte fra leads.created_at.
export async function buildNewLeadsPerWeek(
  supabase: any,
  weeks = 8,
): Promise<ChartPoint[]> {
  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - weeks * 7);

  const { data } = await supabase
    .from("leads")
    .select("created_at")
    .gte("created_at", since.toISOString());

  const counts = new Array(weeks).fill(0);
  for (const row of (data ?? []) as { created_at: string }[]) {
    const created = new Date(row.created_at);
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
    const bucket = weeks - 1 - Math.floor(diffDays / 7);
    if (bucket >= 0 && bucket < weeks) counts[bucket] += 1;
  }

  return counts.map((value, i) => {
    const weeksAgo = weeks - 1 - i;
    return { label: weeksAgo === 0 ? "Denne uge" : `-${weeksAgo}u`, value };
  });
}
