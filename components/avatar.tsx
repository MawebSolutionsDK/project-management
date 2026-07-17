function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const PALETTE = [
  "bg-accent-soft text-accent",
  "bg-gold-soft text-gold",
  "bg-rust-soft text-rust",
];

// Initial-baseret avatar (ingen billeder i systemet) - konsekvent farve pr. navn via en
// simpel hash, så samme kunde/lead altid får samme farve på tværs af sider.
export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";
  const cls = PALETTE[hashString(name) % PALETTE.length];
  const sizeCls = size === "sm" ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeCls} ${cls}`}
    >
      {initials}
    </span>
  );
}
