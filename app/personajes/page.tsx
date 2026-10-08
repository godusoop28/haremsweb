import type { Metadata } from "next";
import CharacterBrowser from "@/components/CharacterBrowser";
import { getMergedCharacters } from "@/lib/characters";
import { FREE_MESSAGES_PER_CHARACTER } from "@/lib/data";

export const metadata: Metadata = {
  title: "Personajes — HAREMS",
};

export default async function PersonajesPage() {
  const characters = await getMergedCharacters();

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300">
            16 personalidades disponibles
          </span>
          <h1 className="mt-5 text-3xl font-bold text-white sm:text-5xl">
            Elige a tu <span className="text-gradient">compañera ideal</span>
          </h1>
          <p className="mt-4 text-slate-400">
            Crea tu cuenta gratis y prueba a cada chica con {FREE_MESSAGES_PER_CHARACTER} mensajes
            (Victoria es exclusiva VIP). Con Premium o VIP sigues la conversación y desbloqueas sus fotos.
          </p>
        </div>

        <CharacterBrowser characters={characters} />
      </div>
    </section>
  );
}
