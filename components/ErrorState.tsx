interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/** Estado de error coherente para toda la app — nunca un mensaje técnico crudo. */
export default function ErrorState({ message, onRetry, className = "" }: ErrorStateProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300 ${className}`}
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-full border border-rose-400/30 px-3 py-1 text-xs font-medium hover:bg-rose-400/10"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
