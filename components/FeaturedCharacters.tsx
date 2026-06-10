import Image from "next/image";
import Link from "next/link";
import { characters } from "@/lib/data";
import PremiumBadge from "./PremiumBadge";

export default function FeaturedCharacters() {
  const featured = characters.slice(0, 6);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Personajes <span className="text-gradient">destacados</span>
            </h2>
            <p className="mt-3 max-w-xl text-slate-400">
              Una probada de las personalidades que te esperan dentro de HAREMS.
            </p>
          </div>
          <Link
            href="/personajes"
            className="glass shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-400/40"
          >
            Ver los 12 personajes
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((character) => (
            <Link
              key={character.id}
              href={`/personajes/${character.id}`}
              className="glass group flex items-center gap-4 rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_0_30px_-14px_rgba(34,211,238,0.5)]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-cyan-400/10">
                <Image
                  src={character.image}
                  alt={character.name}
                  fill
                  sizes="64px"
                  className="object-cover object-[center_18%]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-base font-semibold text-white">
                    {character.name}
                  </h3>
                  <PremiumBadge
                    access={character.access}
                    isPremium={character.isPremium}
                    className="shrink-0"
                  />
                </div>
                <p className="mt-1 truncate text-sm text-slate-400">{character.archetype}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
