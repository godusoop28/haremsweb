import type { RelationshipStatus } from "@/lib/data";

interface ConnectionMeterProps {
  trustLevel: number;
  relationshipStatus: RelationshipStatus;
  challenge?: string;
  conquestTip?: string;
  variant?: "full" | "compact";
  className?: string;
}

const MAX_LEVEL = 5;

export default function ConnectionMeter({
  trustLevel,
  relationshipStatus,
  challenge,
  conquestTip,
  variant = "full",
  className = "",
}: ConnectionMeterProps) {
  if (variant === "compact") {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>Conexión</span>
          <span className="font-medium text-cyan-300">
            {trustLevel} / {MAX_LEVEL} · {relationshipStatus}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            style={{ width: `${(trustLevel / MAX_LEVEL) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
          Nivel de conexión
        </h3>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
          {relationshipStatus}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
            style={{ width: `${(trustLevel / MAX_LEVEL) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-semibold text-white">
          {trustLevel} / {MAX_LEVEL}
        </span>
      </div>

      {challenge && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reto</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{challenge}</p>
        </div>
      )}

      {conquestTip && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Cómo conquistarla
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{conquestTip}</p>
        </div>
      )}
    </div>
  );
}
