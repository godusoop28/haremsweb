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
              16 personalidades IA disponibles
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[64px]">
              Conversa. Conecta.{" "}
              <span className="text-gradient">Crea.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
              Descubre personajes IA con personalidades únicas, conexión progresiva e
              imágenes personalizadas dentro de cada conversación.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/personajes"
                className="glow-button w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-3.5 text-center text-sm font-semibold text-white transition-transform hover:scale-105 sm:w-auto"
              >
                Explorar personajes
              </Link>
              <Link
                href="/registro"
                className="glass-strong w-full rounded-full px-8 py-3.5 text-center text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 sm:w-auto"
              >
                Crear cuenta
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Empieza gratis con personajes seleccionados.
            </p>
          </div>

          {/* Columna derecha: la imagen protagonista vive en HeroBackground; acá solo flotan las
              preview cards que explican el producto de un vistazo (chat, conexión, imágenes). */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="animate-float absolute right-[6%] top-[6%] w-56">
              <PreviewCard
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                }
                title="Conversación"
                text="Respuestas naturales, día y noche"
              />
            </div>
            <div className="animate-float absolute right-[22%] top-[42%] w-52 [animation-delay:1.5s]">
              <PreviewCard
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                }
                title="Conexión progresiva"
                text="Su nivel de confianza crece contigo"
              />
            </div>
            <div className="animate-float absolute bottom-[10%] right-[2%] w-56 [animation-delay:3s]">
              <PreviewCard
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5h.008v.008H3v-.008Zm0 0V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v10.5Z" />
                }
                title="Imágenes a medida"
                text="Genera nuevas escenas al instante"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="glass-strong flex items-start gap-3 rounded-2xl p-4 shadow-2xl">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-cyan-300">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {icon}
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-slate-400">{text}</p>
      </div>
    </div>
  );
}
