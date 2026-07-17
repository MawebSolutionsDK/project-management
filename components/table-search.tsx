"use client";

// Simpel client-side filtrering: hver søgbar tabelrække skal have et
// data-search-row="..." attribut med den tekst der kan søges i. Ingen ny server-forespørgsel
// nødvendigt ved denne datamængde - skjuler blot ikke-matchende rækker via style.display.
export function TableSearch({ placeholder }: { placeholder: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={(e) => {
        const q = e.target.value.trim().toLowerCase();
        document
          .querySelectorAll<HTMLElement>("[data-search-row]")
          .forEach((row) => {
            const haystack = row.dataset.searchRow?.toLowerCase() ?? "";
            row.style.display = q === "" || haystack.includes(q) ? "" : "none";
          });
      }}
      className="input max-w-xs"
    />
  );
}
