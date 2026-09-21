"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { characters } from "@/lib/data";
import GeneratedImage, { daysUntilExpiration } from "@/components/GeneratedImage";
import { downloadImage } from "@/lib/downloadImage";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SkeletonCardGrid } from "@/components/Skeleton";
import { api, ApiError, type ImageGalleryItemResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const PAGE_SIZE = 24;

const levelLabels: Record<string, string> = {
  SAFE: "Normal",
  SENSUAL: "Sensual",
  NUDE: "Sin ropa",
  EXPLICIT: "Explícita",
};

const levelStyles: Record<string, string> = {
  SAFE: "bg-emerald-400/15 text-emerald-300",
  SENSUAL: "bg-pink-400/15 text-pink-300",
  NUDE: "bg-cyan-400/15 text-cyan-300",
  EXPLICIT: "bg-rose-400/15 text-rose-300",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ImagesClient() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState<ImageGalleryItemResponse[]>([]);
  const [characterFilter, setCharacterFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<ImageGalleryItemResponse | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login?next=/dashboard/imagenes");
    }
  }, [authLoading, token, router]);

  const loadPage = useCallback(
    (targetPage: number, filter: string, replace: boolean) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      api
        .getMyImages(token, { characterSlug: filter || undefined, page: targetPage, size: PAGE_SIZE })
        .then((res) => {
          setImages((prev) => (replace ? res.content : [...prev, ...res.content]));
          setHasMore(targetPage + 1 < res.totalPages);
          setPage(targetPage);
        })
        .catch((err) => {
          setError(err instanceof ApiError ? err.message : "No se pudieron cargar tus imágenes.");
        })
        .finally(() => setLoading(false));
    },
    [token]
  );

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(0, characterFilter, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, characterFilter]);

  if (authLoading || !token) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">Cargando...</div>
      </section>
    );
  }

  const completed = images.filter((img) => img.status === "COMPLETED");

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-500 transition-colors hover:text-cyan-300"
            >
              Cuenta
            </Link>
            <span className="mx-1.5 text-xs text-slate-600">/</span>
            <span className="text-xs font-medium text-slate-400">Mis imágenes</span>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Mis <span className="text-gradient">imágenes</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Todo lo que has creado con tus personajes.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Personaje
            <select
              value={characterFilter}
              onChange={(e) => setCharacterFilter(e.target.value)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 focus:border-cyan-400/40 focus:outline-none"
            >
              <option value="">Todos los personajes</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <ErrorState className="mt-6" message={error} onRetry={() => loadPage(0, characterFilter, true)} />
        )}

        {loading && images.length === 0 && <SkeletonCardGrid className="mt-8" count={10} />}

        {!loading && completed.length === 0 && (
          <EmptyState
            className="mt-10"
            title="Todavía no tienes imágenes"
            description={`No hay fotos generadas${characterFilter ? " con este personaje" : ""} todavía.`}
            action={
              <Link
                href="/chat"
                className="inline-block rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Generar mi primera foto
              </Link>
            }
          />
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {completed.map((img) => (
            <button
              key={img.id}
              onClick={() => setLightbox(img)}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 text-left transition-colors hover:border-cyan-400/30"
            >
              <div className="aspect-[3/4] w-full overflow-hidden">
                <GeneratedImage
                  src={img.imageUrl}
                  alt={`Imagen de ${img.characterName}`}
                  loading="lazy"
                  expiresAt={img.expiresAt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
                <p className="truncate text-xs font-semibold text-white">{img.characterName}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-300">{formatDate(img.createdAt)}</span>
                  {img.adultLevel && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        levelStyles[img.adultLevel] ?? "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {levelLabels[img.adultLevel] ?? img.adultLevel}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {lightbox && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex max-h-[90vh] max-w-2xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <GeneratedImage
                src={lightbox.imageUrl}
                alt={`Imagen de ${lightbox.characterName}`}
                expiresAt={lightbox.expiresAt}
                className="max-h-[75vh] rounded-2xl object-contain shadow-2xl"
              />
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
                <span className="font-medium text-white">{lightbox.characterName}</span>
                <span className="text-slate-500">·</span>
                <span>{formatDate(lightbox.createdAt)}</span>
                {lightbox.adultLevel && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      levelStyles[lightbox.adultLevel] ?? "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {levelLabels[lightbox.adultLevel] ?? lightbox.adultLevel}
                  </span>
                )}
                {(() => {
                  const daysLeft = daysUntilExpiration(lightbox.expiresAt);
                  if (daysLeft === null || daysLeft < 0) return null;
                  return (
                    <button
                      onClick={() => downloadImage(lightbox.imageUrl, `harems-${lightbox.characterSlug}-${lightbox.id}.webp`)}
                      className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-400/20"
                    >
                      Descargar{daysLeft <= 3 ? ` (expira en ${daysLeft}d)` : ""}
                    </button>
                  );
                })()}
              </div>
              <Link
                href={`/chat?personaje=${lightbox.characterSlug}`}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-400/20"
              >
                Ir a la conversación
              </Link>
            </div>
          </div>
        )}

        {loading && (
          <p className="mt-6 text-center text-sm text-slate-400">Cargando…</p>
        )}

        {!loading && hasMore && completed.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => loadPage(page + 1, characterFilter, false)}
              className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/20"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
