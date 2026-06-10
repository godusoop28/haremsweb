import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-400/10 bg-[#03050b]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              HARE<span className="text-gradient">MS</span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              Una plataforma privada de chat con personajes de inteligencia artificial,
              diseñada para conversaciones personalizadas y seguras.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Plataforma</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link href="/personajes" className="hover:text-cyan-300">Personajes</Link></li>
              <li><Link href="/planes" className="hover:text-cyan-300">Planes</Link></li>
              <li><Link href="/chat" className="hover:text-cyan-300">Chat demo</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-300">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Cuenta</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link href="/login" className="hover:text-cyan-300">Iniciar sesión</Link></li>
              <li><Link href="/registro" className="hover:text-cyan-300">Crear cuenta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Solo para mayores de 18 años</li>
              <li>Plataforma privada y segura</li>
              <li>Contenido simulado con fines demostrativos</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} HAREMS. Todos los derechos reservados. Maqueta visual
          sin conexión a servicios reales.
        </div>
      </div>
    </footer>
  );
}
