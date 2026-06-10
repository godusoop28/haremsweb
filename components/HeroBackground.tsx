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
          className="object-cover object-[78%_22%] brightness-[0.7] saturate-[0.95]"
        />
        {/* Even dark veil so the image sits calmly inside the dark theme */}
        <div className="absolute inset-0 bg-[#03050b]/30" />
        {/* Fade the left edge into the background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03050b] via-[#03050b]/25 to-transparent to-40%" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#03050b] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#03050b]/60 to-transparent" />
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

      {/* Ambient neon glows, kept on the text side so they don't wash out the image */}
      <div className="absolute left-[8%] top-[-8%] h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute left-[-8%] bottom-[-5%] h-72 w-72 rounded-full bg-indigo-600/20 blur-[110px]" />
      <div className="absolute right-0 top-[15%] hidden h-64 w-64 rounded-full bg-cyan-400/10 blur-[120px] lg:block" />

      {/* Subtle futuristic line */}
      <div className="absolute right-[-10%] top-1/4 h-px w-[60%] rotate-12 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent lg:right-[5%]" />

      {/* Soft edge vignette, kept light so the image stays bright */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#03050b_100%)]" />
    </div>
  );
}
