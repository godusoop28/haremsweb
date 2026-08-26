export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

/** Grid de tarjetas placeholder (personajes/galería) mientras carga, evita el "flash" de contenido desordenado. */
export function SkeletonCardGrid({ count = 8, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="aspect-[3/4]" />
      ))}
    </div>
  );
}
