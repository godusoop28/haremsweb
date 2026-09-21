"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import GeneratedImage from "@/components/GeneratedImage";
import LiveConnectionMeter from "@/components/LiveConnectionMeter";
import { characters } from "@/lib/data";
import { canAccessType } from "@/lib/access";
import { useRemoteCharacters } from "@/lib/useCharacters";
import {
  api,
  type ConversationResponse,
  type ImageGalleryItemResponse,
  type RelationshipResponse,
  type UserResponse,
} from "@/lib/api";

const planLabels: Record<UserResponse["plan"], string> = {
  FREE: "Gratis",
  TRIAL_3_DAYS: "Pase 3 días",
  PREMIUM: "Premium",
  VIP: "VIP",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

/**
 * Home para usuarios ya logueados — "entrada a la app", no un dashboard duplicado (ver punto 16
 * del rediseño). El detalle completo (créditos, estadísticas, historial) sigue viviendo en
 * /dashboard; acá solo se resume lo justo para retomar donde se quedó.
 */
export default function AuthenticatedHome({ user, token }: { user: UserResponse; token: string }) {
  const remoteCharacters = useRemoteCharacters();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [relationship, setRelationship] = useState<RelationshipResponse | null>(null);
  const [recentImages, setRecentImages] = useState<ImageGalleryItemResponse[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .getConversations(token)
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoaded(true));
    api
      .getMyImages(token, { size: 4 })
      .then((page) => setRecentImages(page.content.filter((img) => img.status === "COMPLETED")))
      .catch(() => {});
  }, [token]);

  const latest = conversations[0];

  useEffect(() => {
    if (!latest) return;
    api.getRelationship(token, latest.characterSlug).then(setRelationship).catch(() => {});
  }, [token, latest]);

  const recommended = characters
    .filter((c) => {
      if (c.comingSoon) return false;
      const remote = remoteCharacters.find((r) => r.slug === c.id);
      const accessible = remote ? canAccessType(user.plan, remote.accessType) : !c.isPremium;
      const alreadyChatting = conversations.some((conv) => conv.characterSlug === c.id);
      return accessible && !alreadyChatting;
    })
    .slice(0, 3);

  const firstName = user.name.split(" ")[0];

  return (
    <section className="px-4 pb-20 pt-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Hero personalizado */}
        <div className="glass-strong overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-300">
                Bienvenido de nuevo, {firstName}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                {latest ? "Continúa donde lo dejaste" : "Elige a tu primera conversación"}
              </h1>

              {loaded && latest ? (
                <div className="mt-6 flex items-center gap-4">
                  <Avatar name={latest.characterName} image={latest.characterImageUrl} size="lg" />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-white">{latest.characterName}</p>
                    <p className="text-xs text-slate-400">Última actividad: {relativeTime(latest.updatedAt)}</p>
                    {relationship && (
                      <LiveConnectionMeter
                        level={relationship.connectionLevel}
                        maxLevel={relationship.maxLevel}
                        status={relationship.relationshipStatus}
                        progressPercent={relationship.progressPercent}
                        nextLevelAt={relationship.nextLevelAt}
                        points={relationship.connectionPoints}
                        className="mt-2 w-56"
                      />
                    )}
                  </div>
                </div>
              ) : loaded ? (
                <p className="mt-4 max-w-md text-sm text-slate-400">
                  Aún no has empezado ninguna conversación. Explora el catálogo y elige con quién
                  quieres hablar primero.
                </p>
              ) : (
                <div className="mt-6 h-16 w-64 animate-pulse rounded-xl bg-white/5" />
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={latest ? `/chat?personaje=${latest.characterSlug}` : "/personajes"}
                  className="glow-button rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
                >
                  {latest ? "Continuar conversación" : "Explorar personajes"}
                </Link>
                {latest && (
                  <Link
                    href="/personajes"
                    className="glass rounded-full px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-300"
                  >
                    Explorar personajes
                  </Link>
                )}
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-center lg:text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Tu plan</p>
              <p className="mt-1 text-xl font-bold text-gradient">{planLabels[user.plan]}</p>
              <Link
                href="/dashboard"
                className="mt-3 inline-block text-xs font-medium text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
              >
                Gestionar cuenta →
              </Link>
            </div>
          </div>
        </div>

        {/* Resumen: imágenes + recomendados */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {recentImages.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">Últimas imágenes</h2>
                <Link
                  href="/dashboard/imagenes"
                  className="text-xs font-medium text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2.5">
                {recentImages.map((img) => (
                  <Link
                    key={img.id}
                    href={`/chat?personaje=${img.characterSlug}`}
                    className="group aspect-[3/4] overflow-hidden rounded-xl border border-white/5 transition-colors hover:border-cyan-400/30"
                  >
                    <GeneratedImage
                      src={img.imageUrl}
                      alt={`Imagen de ${img.characterName}`}
                      loading="lazy"
                      expiresAt={img.expiresAt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recommended.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white">Personajes recomendados</h2>
              <div className="mt-4 space-y-2">
                {recommended.map((c) => (
                  <Link
                    key={c.id}
                    href={`/chat?personaje=${c.id}`}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:border-cyan-400/30"
                  >
                    <Avatar name={c.name} image={c.image} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{c.name}</p>
                      <p className="truncate text-xs text-slate-400">{c.archetype}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
