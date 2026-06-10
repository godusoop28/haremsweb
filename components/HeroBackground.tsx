import Image from "next/image";

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#03050b]">
      {/* Desktop: image protagonist on the right, fading into the dark background */}
      <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <Image
          src="/portada.png"
          alt="Personajes IA de HAREMS"
          fill
          priority
          sizes="58vw"
          className="object-cover object-[80%_18%] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03050b] via-[#03050b]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-transparent to-[#03050b]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03050b]/40 via-transparent to-transparent" />
      </div>

      {/* Mobile / tablet: tenue banner behind the text */}
      <div className="absolute inset-x-0 top-0 h-[55%] lg:hidden">
        <Image
          src="/portada.png"
          alt="Personajes IA de HAREMS"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_15%] opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03050b]/30 via-[#03050b] to-[#03050b]" />
      </div>

      {/* Ambient neon glows */}
      <div className="absolute left-[8%] top-[-8%] h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute right-[6%] top-[28%] h-72 w-72 rounded-full bg-cyan-400/20 blur-[110px]" />
      <div className="absolute left-[-8%] bottom-[-5%] h-72 w-72 rounded-full bg-indigo-600/20 blur-[110px]" />

      {/* Subtle futuristic line */}
      <div className="absolute right-[-10%] top-1/4 h-px w-[60%] rotate-12 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent lg:right-[5%]" />

      {/* Vignette to keep edges deep black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#03050b_88%)]" />
    </div>
  );
}
