"use client";

import { useEffect, useState } from "react";
import { api, type CharacterResponse } from "@/lib/api";

/**
 * Personajes tal como los devuelve el backend (fuente de verdad para accessType, isPremium,
 * isVip, imageGenerationEnabled, etc). Antes cada componente cliente (ChatClient,
 * DashboardClient) repetía su propio `useState` + `useEffect` con `api.getCharacters()` — esto
 * lo centraliza. El contenido puramente editorial (tags, quote, sampleMessages...) que todavía
 * no vive en backend sigue viniendo de `lib/data.ts`.
 */
export function useRemoteCharacters(): CharacterResponse[] {
  const [remoteCharacters, setRemoteCharacters] = useState<CharacterResponse[]>([]);

  useEffect(() => {
    api.getCharacters().then(setRemoteCharacters).catch(() => {});
  }, []);

  return remoteCharacters;
}
