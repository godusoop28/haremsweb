import Image from "next/image";

export type LogoVariant = "horizontal" | "emblem" | "vertical";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

const srcs: Record<LogoVariant, string> = {
  horizontal: "/1-removebg-preview.png",
  emblem:     "/2-removebg-preview.png",
  vertical:   "/3-removebg-preview.png",
};

// [width, height] en px para cada variante × tamaño
const dims: Record<LogoVariant, Record<LogoSize, [number, number]>> = {
  horizontal: {
    xs: [120, 40],
    sm: [160, 52],
    md: [220, 72],
    lg: [320, 104],
    xl: [520, 170],
  },
  emblem: {
    xs: [32,  32],
    sm: [44,  44],
    md: [64,  64],
    lg: [96,  96],
    xl: [140, 140],
  },
  vertical: {
    xs: [90,  120],
    sm: [130, 170],
    md: [190, 250],
    lg: [280, 360],
    xl: [420, 540],
  },
};

export default function BrandLogo({
  variant = "horizontal",
  size = "md",
  className = "",
  priority = false,
}: BrandLogoProps) {
  const [w, h] = dims[variant][size];
  return (
    <Image
      src={srcs[variant]}
      alt="HAREMS"
      width={w}
      height={h}
      className={`flex-shrink-0 object-contain select-none ${className}`}
      priority={priority}
      draggable={false}
    />
  );
}
