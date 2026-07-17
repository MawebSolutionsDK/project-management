import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <SearchX className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-ink">Kunne ikke findes</h1>
        <p className="mt-1 max-w-sm text-sm text-ink/55">
          Siden eller posten findes ikke, eller er blevet slettet.
        </p>
      </div>
      <Link href="/dashboard" className="btn-primary">
        Til oversigten
      </Link>
    </div>
  );
}
