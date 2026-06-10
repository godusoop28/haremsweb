import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/lib/data";

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="glass group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_0_35px_-12px_rgba(34,211,238,0.5)]">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={character.image}
          alt={character.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/10 to-transparent" />

        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
            character.isPremium
              ? "bg-cyan-400/15 text-cyan-300"
              : "bg-emerald-400/15 text-emerald-300"
          }`}
        >
          {character.access}
        </span>

        {character.isPremium && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <svg
              className="h-9 w-9 text-cyan-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 text-center">
        <h3 className="text-lg font-semibold text-white">{character.name}</h3>
        <p className="mt-1 text-xs font-medium text-cyan-300">{character.archetype}</p>
        <p className="mt-1 text-xs text-slate-400">
          {character.age} años · Dificultad: {character.difficulty}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {character.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/personajes/${character.id}`}
            className="w-full rounded-full border border-cyan-400/30 bg-white/5 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-transform hover:scale-105"
          >
            Ver perfil
          </Link>
          <Link
            href={`/chat?personaje=${character.id}`}
            className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-105 ${
              character.isPremium
                ? "border border-cyan-400/30 bg-white/5 text-cyan-200"
                : "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
            }`}
          >
            {character.isPremium ? "Desbloquear y chatear" : "Chatear"}
          </Link>
        </div>
      </div>
    </div>
  );
}
