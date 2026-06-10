import Image from "next/image";

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#03050b]">
      {/* Desktop: image protagonist on the right, fading into the dark background */}
      <div className="absolute inset-y-0 right-0 hidden w-[62%] lg:block">
        <Image
          src="/portada.png"
          alt="Personajes IA de HAREMS"
          fill
          priority
          quality={90}
          sizes="62vw"
          className="object-cover object-[78%_22%]"
        />
        {/* Fade only the left edge into the background, keep the rest of the image crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03050b] via-[#03050b]/20 to-transparent to-40%" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#03050b] to-transparent" />
      </div>

      {/* Mobile / tablet: visible banner behind the text, fading at the bottom */}
      <div className="absolute inset-x-0 top-0 h-[48%] lg:hidden">
        <Image
          src="/portada.png"
          alt="Personajes IA de HAREMS"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-[55%_18%] opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#03050b]/40 to-[#03050b]" />
      </div>

      {/* Ambient neon glows */}
      <div className="absolute left-[8%] top-[-8%] h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute right-[6%] top-[28%] h-72 w-72 rounded-full bg-cyan-400/15 blur-[110px]" />
      <div className="absolute left-[-8%] bottom-[-5%] h-72 w-72 rounded-full bg-indigo-600/20 blur-[110px]" />

      {/* Subtle futuristic line */}
      <div className="absolute right-[-10%] top-1/4 h-px w-[60%] rotate-12 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent lg:right-[5%]" />

      {/* Soft edge vignette, kept light so the image stays bright */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#03050b_100%)]" />
    </div>
  );
}
