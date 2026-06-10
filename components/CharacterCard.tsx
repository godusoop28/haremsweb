import Link from "next/link";
import Avatar from "./Avatar";
import type { Character } from "@/lib/data";

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="glass group relative flex flex-col items-center rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_0_35px_-12px_rgba(34,211,238,0.5)]">
      <span
        className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
          character.isFree
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-cyan-400/15 text-cyan-300"
        }`}
      >
        {character.isFree ? "Gratis" : "Premium"}
      </span>

      <div className="relative">
        <Avatar name={character.name} gradient={character.gradient} size="lg" />
        {!character.isFree && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <svg
              className="h-7 w-7 text-cyan-200"
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

      <h3 className="mt-4 text-lg font-semibold text-white">{character.name}</h3>
      <p className="text-xs text-slate-400">{character.age} años</p>
      <p className="mt-2 text-sm text-slate-300">{character.personality}</p>

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

      <Link
        href={`/chat?personaje=${character.id}`}
        className={`mt-6 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-105 ${
          character.isFree
            ? "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
            : "border border-cyan-400/30 bg-white/5 text-cyan-200"
        }`}
      >
        {character.isFree ? "Chatear" : "Desbloquear y chatear"}
      </Link>
    </div>
  );
}
