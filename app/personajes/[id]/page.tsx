import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { characters } from "@/lib/data";
import { getMergedCharacter } from "@/lib/characters";
import ConnectionMeter from "@/components/ConnectionMeter";
import PremiumBadge from "@/components/PremiumBadge";
import CharacterDetailActions from "@/components/CharacterDetailActions";

export function generateStaticParams() {
  return characters.map((character) => ({ id: character.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const character = characters.find((c) => c.id === id);
  return {
    title: character ? `${character.name} — HAREMS` : "Personaje — HAREMS",
  };
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getMergedCharacter(id);

  if (!character) {
    notFound();
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/personajes"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
        >
          ← Volver a personajes
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="glass relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
            <Image
              src={character.image}
              alt={character.name}
              fill
              sizes="(max-width: 1024px) 100vw, 380px"
              className="object-cover object-[center_10%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-transparent to-transparent" />
            <PremiumBadge
              access={character.access}
              isPremium={character.isPremium}
              className="absolute right-4 top-4"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{character.name}</h1>
            <p className="mt-2 text-sm font-medium text-cyan-300">{character.archetype}</p>
            <p className="mt-3 text-sm italic leading-relaxed text-slate-400">
              &ldquo;{character.quote}&rdquo;
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="glass rounded-full px-4 py-1.5">{character.age} años</span>
              <span className="glass rounded-full px-4 py-1.5">Acceso: {character.access}</span>
              <span className="glass rounded-full px-4 py-1.5">
                Dificultad: {character.difficulty}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {character.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                  Concepto
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{character.concept}</p>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                  Apariencia física
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {character.appearance}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                  Personalidad
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {character.personality}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                  Reto narrativo
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {character.narrativeChallenge}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                  Dirección visual
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {character.visualDirection}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                    Le gusta
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-300">
                    {character.likes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                    No le gusta
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-300">
                    {character.dislikes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <ConnectionMeter
                trustLevel={character.trustLevel}
                relationshipStatus={character.relationshipStatus}
                challenge={character.challenge}
                conquestTip={character.conquestTip}
              />
            </div>

            <CharacterDetailActions character={character} />
          </div>
        </div>
      </div>
    </section>
  );
}
