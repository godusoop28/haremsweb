import Image from "next/image";

interface AvatarProps {
  name: string;
  image: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

const sizeToPx: Record<NonNullable<AvatarProps["size"]>, number> = {
  sm: 40,
  md: 56,
  lg: 96,
  xl: 128,
};

export default function Avatar({ name, image, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full shadow-lg ring-2 ring-white/10 ${sizeClasses[size]} ${className}`}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes={`${sizeToPx[size]}px`}
        className="object-cover object-[center_18%]"
      />
    </div>
  );
}
