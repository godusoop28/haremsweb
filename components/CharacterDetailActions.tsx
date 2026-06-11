"use client";

import Link from "next/link";
import type { Character } from "@/lib/data";
import type { PlanType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const accessRank: Record<Character["access"], number> = {
  Gratis: 0,
  Premium: 1,
  "Premium / VIP": 2,
};

const planRank: Record<PlanType, number> = {
  FREE: 0,
  TRIAL_3_DAYS: 1,
  PREMIUM: 1,
  VIP: 2,
};

export default function CharacterDetailActions({ character }: { character: Character }) {
  const { user } = useAuth();
  const locked = planRank[user?.plan ?? "FREE"] < accessRank[character.access];

  return (
    <div className="mt-8 flex flex-col gap-3 sm:w-fit sm:flex-row">
      <Link
        href={locked ? "/planes" : `/chat?personaje=${character.id}`}
        className={`w-full rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 sm:w-fit ${
          locked
            ? "border border-cyan-400/30 bg-white/5 text-cyan-200"
            : "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
        }`}
      >
        {locked ? "Desbloquear y empezar conversación" : "Empezar conversación"}
      </Link>
      {locked && (
        <Link
          href="/planes"
          className="glass w-full rounded-full px-6 py-3 text-center text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-400/40 sm:w-fit"
        >
          Ver planes
        </Link>
      )}
    </div>
  );
}
