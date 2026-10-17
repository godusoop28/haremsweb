"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";

const SWIPE_THRESHOLD = 40;

interface PhotoGalleryProps {
  photos: string[];
  alt: string;
  sizes: string;
  /** Clases del marco (tamaño, aspect ratio, bordes). Debe ser `relative`. */
  frameClassName: string;
  imageClassName?: string;
  priority?: boolean;
  /** Si se indica, tocar la foto navega a este enlace (las flechas no). */
  href?: string;
  hrefLabel?: string;
  showThumbnails?: boolean;
  /** Capas superpuestas (degradado, insignias, nombre). */
  children?: ReactNode;
}

/**
 * Galería tipo Tinder: flechas, swipe horizontal y teclado. Cada instancia guarda su propio índice.
 * Solo monta las fotos ya vistas y, cuando hay intención (hover/foco/toque), la anterior y la siguiente.
 */
export default function PhotoGallery({
  photos,
  alt,
  sizes,
  frameClassName,
  imageClassName = "",
  priority = false,
  href,
  hrefLabel,
  showThumbnails = false,
  children,
}: PhotoGalleryProps) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const [index, setIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [warm, setWarm] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  // La foto principal nunca se descarta; las extras que fallen se omiten.
  const list = photos.filter((src, i) => i === 0 || !failed.has(src));
  const total = list.length;
  const current = Math.min(index, total - 1);
  const hasGallery = total > 1;

  const goTo = (next: number) => {
    if (next < 0 || next >= total || next === current) return;
    setIndex(next);
    setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
  };

  const shouldMount = (i: number) => visited.has(i) || (warm && Math.abs(i - current) === 1);

  const onArrow = (e: MouseEvent, step: number) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(current + step);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!hasGallery) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(current + 1);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    setWarm(true);
    if (e.pointerType === "mouse") return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || !hasGallery) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    goTo(current + (dx < 0 ? 1 : -1));
    // Evita que el swipe termine abriendo el perfil.
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 400);
  };

  const onClickCapture = (e: MouseEvent) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const arrowClass =
    "absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors duration-200 focus-visible:outline-none";
  const arrowInner =
    "flex h-8 w-8 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/10 backdrop-blur-sm transition-colors duration-200 group-hover/arrow:bg-cyan-400/80 group-hover/arrow:text-[#03050b] group-focus-visible/arrow:bg-cyan-400/80 group-focus-visible/arrow:text-[#03050b] group-focus-visible/arrow:ring-cyan-200";

  return (
    <div>
      <div
        className={`${frameClassName} ${hasGallery ? "touch-pan-y" : ""}`}
        role={hasGallery ? "region" : undefined}
        aria-roledescription={hasGallery ? "carrusel" : undefined}
        aria-label={hasGallery ? `Fotos de ${alt}` : undefined}
        onKeyDown={onKeyDown}
        onPointerEnter={() => setWarm(true)}
        onFocus={() => setWarm(true)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
        onClickCapture={onClickCapture}
      >
        {list.map((src, i) =>
          shouldMount(i) ? (
            <div
              key={src}
              aria-hidden={i !== current}
              className={`absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={src}
                alt={i === 0 ? alt : `${alt}, foto ${i + 1}`}
                fill
                sizes={sizes}
                draggable={false}
                priority={priority && i === 0}
                className={`select-none object-cover ${imageClassName}`}
                onError={
                  i === 0 ? undefined : () => setFailed((prev) => new Set(prev).add(src))
                }
              />
            </div>
          ) : null,
        )}

        {children}

        {href && (
          <Link
            href={href}
            aria-label={hrefLabel ?? alt}
            draggable={false}
            className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/70"
          />
        )}

        {hasGallery && (
          <>
            <div className="pointer-events-none absolute inset-x-3 top-1.5 z-20 flex gap-1" aria-hidden="true">
              {list.map((src, i) => (
                <span
                  key={src}
                  className={`h-[3px] flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                    i === current ? "bg-white/90" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

            <span className="pointer-events-none absolute bottom-4 right-4 z-20 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white/85 backdrop-blur-sm">
              {current + 1} / {total}
            </span>
            <span className="sr-only" aria-live="polite">
              Foto {current + 1} de {total}
            </span>

            {current > 0 && (
              <button
                type="button"
                onClick={(e) => onArrow(e, -1)}
                aria-label={`Foto anterior de ${alt}`}
                className={`group/arrow left-1.5 ${arrowClass}`}
              >
                <span className={arrowInner}>
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </span>
              </button>
            )}
            {current < total - 1 && (
              <button
                type="button"
                onClick={(e) => onArrow(e, 1)}
                aria-label={`Foto siguiente de ${alt}`}
                className={`group/arrow right-1.5 ${arrowClass}`}
              >
                <span className={arrowInner}>
                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {showThumbnails && hasGallery && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === current}
              className={`relative aspect-[3/4] overflow-hidden rounded-xl ring-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                i === current ? "ring-cyan-300/80" : "opacity-60 ring-white/10 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="120px" className={`object-cover ${imageClassName}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
