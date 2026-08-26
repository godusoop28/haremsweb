"use client";

import { useMemo, useState } from "react";
import CharacterCard from "@/components/CharacterCard";
import EmptyState from "@/components/EmptyState";
import type { Access, Character } from "@/lib/data";

type FilterKey = "all" | "free" | "premium" | "vip";
type SortKey = "recommended" | "name" | "difficulty";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "free", label: "Gratis" },
  { key: "premium", label: "Premium" },
  { key: "vip", label: "VIP" },
];

const DIFFICULTY_RANK: Record<string, number> = {
  "Fácil": 0,
  "Fácil / Media": 1,
  "Media": 2,
  "Media / Fácil": 1,
  "Media / Alta": 3,
  "Alta": 4,
  "Muy alta": 5,
  "Extrema": 6,
};

function matchesFilter(access: Access, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "free") return access === "Gratis";
  if (filter === "vip") return access === "Premium / VIP";
  return access === "Premium";
}

export default function CharacterBrowser({ characters }: { characters: Character[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("recommended");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = characters.filter((c) => {
      if (!matchesFilter(c.access, filter)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.archetype.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
    } else if (sort === "difficulty") {
      list = [...list].sort(
        (a, b) => (DIFFICULTY_RANK[a.difficulty] ?? 99) - (DIFFICULTY_RANK[b.difficulty] ?? 99)
      );
    }

    return list;
  }, [characters, query, filter, sort]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Buscar por nombre, personalidad o tag…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f.key
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
          Ordenar por
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 focus:border-cyan-400/40 focus:outline-none"
          >
            <option value="recommended">Recomendado</option>
            <option value="name">Nombre A-Z</option>
            <option value="difficulty">Dificultad</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No encontramos personajes"
          description="Prueba con otra búsqueda o quita algún filtro."
        />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      )}
    </>
  );
}
