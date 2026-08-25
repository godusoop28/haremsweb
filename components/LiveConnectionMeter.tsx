import { relationshipStatusLabels, type RelationshipStatus } from "@/lib/api";

interface LiveConnectionMeterProps {
  level: number;
  maxLevel: number;
  status: RelationshipStatus;
  progressPercent: number;
  nextLevelAt?: number | null;
  points?: number;
  className?: string;
}

/**
 * Medidor de conexión REAL (respaldado por UserCharacterRelationship en backend) — a diferencia
 * de components/ConnectionMeter.tsx, que sigue mostrando el "reto" editorial estático del perfil
 * público del personaje (marketing/lore, no el progreso de un usuario en particular).
 */
export default function LiveConnectionMeter({
  level,
  maxLevel,
  status,
  progressPercent,
  nextLevelAt,
  points,
  className = "",
}: LiveConnectionMeterProps) {
  const isMaxLevel = nextLevelAt == null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="font-medium text-slate-300">
          Conexión <span className="text-slate-500">· Nivel {level}/{maxLevel}</span>
        </span>
        <span className="font-semibold text-cyan-300">{relationshipStatusLabels[status]}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-[width] duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {!isMaxLevel && points != null && (
        <span className="self-end text-[10px] text-slate-500">
          {points} / {nextLevelAt} para el siguiente nivel
        </span>
      )}
      {isMaxLevel && (
        <span className="self-end text-[10px] text-cyan-400/80">Conexión al máximo</span>
      )}
    </div>
  );
}
