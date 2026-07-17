import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

// Altid synlig på touch/mobil (der findes ikke rigtig "hover" der); tonet ned til kun at
// vise sig ved hover over raekken på skaerme med mus (md: og opefter), for at holde
// tabellerne rene på desktop uden at goere handlingerne utilgaengelige på mobil.
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
    <div className="flex items-center justify-end gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
      <Link
        href={editHref}
        className="rounded-md p-1.5 text-ink/55 transition hover:bg-ink/[0.06] hover:text-accent"
        title="Redigér"
        aria-label="Redigér"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <form action={deleteAction}>
        <button
          type="submit"
          className="rounded-md p-1.5 text-ink/55 transition hover:bg-ink/[0.06] hover:text-rust"
          title="Slet"
          aria-label="Slet"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
