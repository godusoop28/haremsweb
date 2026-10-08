"use client";

import Link from "next/link";
import type { Character } from "@/lib/data";
import { canAccessLabel } from "@/lib/access";
import { useAuth } from "@/lib/auth-context";
import { freeTrialLabel, useFreeMessages } from "@/lib/useFreeMessages";

export default function CharacterDetailActions({ character }: { character: Character }) {
  const { user } = useAuth();
  const { statuses } = useFreeMessages();
  const locked = !canAccessLabel(user?.plan, character.access);
  const trialStatus = statuses[character.id];
  const trialLabel = freeTrialLabel(trialStatus);
  const trialAvailable = !!trialStatus && !trialStatus.hasPaidAccess && trialStatus.remaining > 0;
  const canChat = !locked || trialAvailable;

  if (character.comingSoon === true) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:w-fit sm:flex-row">
        <span className="w-full cursor-not-allowed rounded-full border border-amber-300/30 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-amber-200/80 sm:w-fit">
          Muy pronto
        </span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {trialLabel && (
        <p className={`mb-3 text-xs font-medium ${trialAvailable ? "text-cyan-300" : "text-slate-500"}`}>
          {trialAvailable ? `Prueba gratis · ${trialLabel}` : trialLabel}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:w-fit sm:flex-row">
        <Link
          href={canChat ? `/chat?personaje=${character.id}` : "/planes"}
          className={`w-full rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 sm:w-fit ${
            canChat
              ? "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
              : "border border-cyan-400/30 bg-white/5 text-cyan-200"
          }`}
        >
          {!canChat ? "Desbloquear y empezar conversación" : locked ? "Probar gratis" : "Empezar conversación"}
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
    </div>
  );
}
