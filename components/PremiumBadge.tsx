interface PremiumBadgeProps {
  access: string;
  isPremium: boolean;
  className?: string;
}

export default function PremiumBadge({ access, isPremium, className = "" }: PremiumBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
        isPremium
          ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30"
          : "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30"
      } ${className}`}
    >
      {isPremium && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      )}
      {access}
    </span>
  );
}
