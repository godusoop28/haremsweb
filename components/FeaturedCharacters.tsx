import Image from "next/image";
import Link from "next/link";
import { characters } from "@/lib/data";
import PremiumBadge from "./PremiumBadge";

export default function FeaturedCharacters() {
  const featured = characters.slice(0, 4);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Conoce algunas <span className="text-gradient">personalidades</span>
            </h2>
          </div>
          <Link
            href="/personajes"
            className="glass shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-400/40"
          >
            Ver los 16 personajes
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((character) => (
            <Link
              key={character.id}
              href={`/personajes/${character.id}`}
              className="glass group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:border-white/15"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={character.image}
                  alt={character.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-[center_15%] transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/10 to-transparent" />
                <PremiumBadge
                  access={character.access}
                  isPremium={character.isPremium}
                  className="absolute right-2.5 top-2.5"
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="truncate text-base font-semibold text-white">{character.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-slate-300">{character.archetype}</p>
                </div>
              </div>
              <span className="border-t border-white/5 px-4 py-2.5 text-center text-xs font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200">
                Conocer
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
