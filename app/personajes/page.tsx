import type { Metadata } from "next";
import CharacterCard from "@/components/CharacterCard";
import { characters } from "@/lib/data";

export const metadata: Metadata = {
  title: "Personajes — HAREMS",
};

export default function PersonajesPage() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300">
            12 personalidades disponibles
          </span>
          <h1 className="mt-5 text-3xl font-bold text-white sm:text-5xl">
            Elige a tu <span className="text-gradient">compañera ideal</span>
          </h1>
          <p className="mt-4 text-slate-400">
            Luna y Hana están disponibles de forma gratuita para usuarios registrados.
            El resto de personajes forman parte de la experiencia Premium.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </div>
    </section>
  );
}
