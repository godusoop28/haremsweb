"use client";

import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/lib/data";
import { canAccessLabel } from "@/lib/access";
import { useAuth } from "@/lib/auth-context";
import PremiumBadge from "./PremiumBadge";

const MAX_VISIBLE_TAGS = 3;

export default function CharacterCard({ character }: { character: Character }) {
  const { user } = useAuth();
  const comingSoon = character.comingSoon === true;
  const locked = !canAccessLabel(user?.plan, character.access);
  const visibleTags = character.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = character.tags.length - visibleTags.length;

  return (
    <div className="glass group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15">
      <Link href={`/personajes/${character.id}`} className="relative block aspect-[3/4] w-full overflow-hidden">
        <Image
          src={character.image}
          alt={character.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-[center_12%] transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/25 to-transparent" />

        <PremiumBadge
          access={character.access}
          isPremium={character.isPremium}
          className="absolute right-3 top-3"
        />

        {comingSoon && (
          <span className="absolute left-3 top-3 rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200 backdrop-blur-sm">
            Muy pronto
          </span>
        )}

        {locked && (
          <div className="absolute right-3 top-11 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-slate-300 backdrop-blur-sm">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-base font-semibold text-white">{character.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-cyan-300">{character.archetype}</p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 border-t border-white/5 p-4">
        <p className="text-xs text-slate-500">
          {character.age} años · Dificultad: {character.difficulty}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-300"
            >
              {tag}
            </span>
          ))}
          {extraTagCount > 0 && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-500">
              +{extraTagCount}
            </span>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/personajes/${character.id}`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-slate-200 transition-colors hover:border-white/20"
          >
            Ver perfil
          </Link>
          {comingSoon ? (
            <span className="cursor-not-allowed rounded-full border border-amber-300/30 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-amber-200/80">
              Muy pronto
            </span>
          ) : (
            <Link
              href={locked ? "/planes" : `/chat?personaje=${character.id}`}
              className={`rounded-full px-3 py-2 text-center text-xs font-semibold transition-transform hover:scale-[1.03] ${
                locked
                  ? "border border-cyan-400/30 bg-white/5 text-cyan-200"
                  : "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
              }`}
            >
              {locked ? "Desbloquear" : "Chatear"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
