import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink/55">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <p className="text-sm">Indlæser...</p>
    </div>
  );
}
