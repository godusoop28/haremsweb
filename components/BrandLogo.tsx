type Variant = "horizontal" | "emblem" | "hero" | "footer";
type Size = "sm" | "md" | "lg";

interface BrandLogoProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const srcs: Record<Variant, string> = {
  horizontal: "/brand/harems/sistema/nav-logo-horizontal-dark-320x80.png",
  emblem:     "/brand/harems/sistema/nav-emblema-64x64.png",
  hero:       "/brand/harems/web/hero-logo-horizontal-1200x300.png",
  footer:     "/brand/harems/web/footer-logo-horizontal-640x160.png",
};

const dims: Record<Variant, { w: number; h: number }> = {
  horizontal: { w: 320, h: 80 },
  emblem:     { w: 64,  h: 64 },
  hero:       { w: 1200, h: 300 },
  footer:     { w: 640, h: 160 },
};

const sizeClass: Record<Variant, Record<Size, string>> = {
  horizontal: { sm: "h-7 w-auto", md: "h-9 w-auto",  lg: "h-12 w-auto" },
  emblem:     { sm: "h-7 w-7",    md: "h-9 w-9",     lg: "h-12 w-12"   },
  hero:       { sm: "h-16 w-auto", md: "h-24 w-auto", lg: "h-32 w-auto" },
  footer:     { sm: "h-8 w-auto", md: "h-12 w-auto", lg: "h-16 w-auto" },
};

export default function BrandLogo({
  variant = "horizontal",
  size = "md",
  className = "",
}: BrandLogoProps) {
  const { w, h } = dims[variant];
  return (
    <img
      src={srcs[variant]}
      alt="HAREMS"
      width={w}
      height={h}
      className={`object-contain select-none ${sizeClass[variant][size]} ${className}`}
      draggable={false}
    />
  );
}
