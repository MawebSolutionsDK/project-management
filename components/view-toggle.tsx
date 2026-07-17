import Link from "next/link";

export function ViewToggle({
  base,
  view,
}: {
  base: string;
  view: "list" | "board";
}) {
  const pill = (active: boolean) =>
    active
      ? "rounded-full bg-ink px-3 py-1 text-xs font-medium text-canvas"
      : "rounded-full px-3 py-1 text-xs font-medium text-ink/55 transition hover:text-ink";

  return (
    <div className="flex gap-1 rounded-full border border-line p-1">
      <Link href={base} className={pill(view === "board")}>
        Board
      </Link>
      <Link href={`${base}?view=list`} className={pill(view === "list")}>
        Liste
      </Link>
    </div>
  );
}
