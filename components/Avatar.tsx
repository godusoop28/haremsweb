interface AvatarProps {
  name: string;
  gradient: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-24 w-24 text-3xl",
  xl: "h-32 w-32 text-4xl",
};

export default function Avatar({ name, gradient, size = "md", className = "" }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white shadow-lg ring-2 ring-white/10 ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  );
}
