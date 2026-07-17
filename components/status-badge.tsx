import type { BadgeTone } from "@/lib/types";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-ink/[0.06] text-ink/70",
  info: "bg-accent-soft text-accent",
  success: "bg-accent-soft text-accent",
  warning: "bg-gold-soft text-gold",
  danger: "bg-rust-soft text-rust",
};

export function StatusBadge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
