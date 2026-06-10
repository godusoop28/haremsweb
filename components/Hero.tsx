import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-cyan-400/15 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-0 h-72 w-72 rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05070d_75%)]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-400" />
          12 personalidades IA disponibles
        </span>

        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          HARE<span className="text-gradient">MS</span>
        </h1>

        <p className="mt-4 text-2xl font-semibold text-slate-100 sm:text-3xl">
          Chat con chicas IA personalizadas
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Elige entre personajes con personalidades, estilos y formas de hablar
          completamente distintas. Conversa, conecta y descubre una experiencia de chat
          impulsada por inteligencia artificial, diseñada para sentirse cercana,
          privada y siempre disponible.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/personajes"
            className="glow-button w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-3.5 text-center text-sm font-semibold text-white transition-transform hover:scale-105 sm:w-auto"
          >
            Explorar personajes
          </Link>
          <Link
            href="/planes"
            className="glass w-full rounded-full px-8 py-3.5 text-center text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 sm:w-auto"
          >
            Ver planes
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
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
    </section>
  );
}
