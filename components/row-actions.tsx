import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

// Vises kun ved hover over raekken (forudsaetter en "group" klasse paa den omgivende <tr>).
// Redigér-linket genbruger samme destination som at klikke paa raekkens navn/titel -
// den nye funktionalitet her er slet-ikonet direkte fra listen.
export function RowActions({
  editHref,
  deleteAction,
}: {
  editHref: string;
  deleteAction: (formData: FormData) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 opacity-0 transition group-hover:opacity-100">
      <Link
        href={editHref}
        className="text-ink/40 transition hover:text-accent"
        title="Redigér"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <form action={deleteAction}>
        <button
          type="submit"
          className="text-ink/40 transition hover:text-rust"
          title="Slet"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
