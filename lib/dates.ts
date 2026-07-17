export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function relativeDayLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} dage forsinket`;
  if (days === 0) return "I dag";
  if (days === 1) return "I morgen";
  return `Om ${days} dage`;
}
