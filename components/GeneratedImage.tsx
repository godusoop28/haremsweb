"use client";

import { useState } from "react";

interface GeneratedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

/**
 * Reemplazo de <img> para imágenes generadas por Runware — sus URLs no son necesariamente
 * permanentes (ver comentario en ImageGeneration.permanentImageUrl), así que esto nunca debe
 * mostrar el ícono roto nativo del navegador. Drop-in: mismo className que llevaría el <img>.
 */
export default function GeneratedImage({ src, alt, className = "", loading, onClick }: GeneratedImageProps) {
  const [errored, setErrored] = useState(false);
  const [attempt, setAttempt] = useState(0);

  if (errored) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 bg-slate-900/70 p-2 text-center ${className}`}>
        <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5h.008v.008H3v-.008Zm0 0V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v10.5Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
        </svg>
        <p className="text-[10px] leading-tight text-slate-500">Esta imagen ya no está disponible.</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAttempt((a) => a + 1);
            setErrored(false);
          }}
          className="text-[10px] font-medium text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={attempt}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setErrored(true)}
      onClick={onClick}
      className={className}
    />
  );
}
