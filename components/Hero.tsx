import Link from "next/link";
import HeroBackground from "./HeroBackground";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-32 lg:pt-32">
      <HeroBackground />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
            <span className="glass-strong inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-300 shadow-[0_0_25px_-8px_rgba(34,211,238,0.6)]">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-400" />
              12 personalidades IA disponibles
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              HARE<span className="text-gradient">MS</span>
            </h1>

            <p className="mt-4 text-2xl font-semibold text-slate-100 sm:text-3xl">
              Chat con chicas IA personalizadas
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
              Elige entre personajes con personalidades, estilos y formas de hablar
              completamente distintas. Conversa, conecta y descubre una experiencia de chat
              impulsada por inteligencia artificial, diseñada para sentirse cercana,
              privada y siempre disponible.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/personajes"
                className="glow-button w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-3.5 text-center text-sm font-semibold text-white transition-transform hover:scale-105 sm:w-auto"
              >
                Explorar personajes
              </Link>
              <Link
                href="/planes"
                className="glass-strong w-full rounded-full px-8 py-3.5 text-center text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 sm:w-auto"
              >
                Ver planes
              </Link>
            </div>
          </div>

          {/* Spacer column: the protagonist image lives in HeroBackground on the right */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4 lg:mx-0">
          {[
            { value: "12", label: "Personalidades únicas" },
            { value: "24/7", label: "Disponibilidad" },
            { value: "100%", label: "Privado y seguro" },
            { value: "18+", label: "Acceso verificado" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl px-4 py-6 text-center">
              <div className="text-2xl font-bold text-gradient sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-slate-400 sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
