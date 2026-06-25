import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Suscripción activada — HAREMS",
};

export default function SubscriptionSuccessPage() {
  return (
    <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
      <div className="glass-strong glow-border mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white">¡Pago recibido!</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Tu suscripción está siendo activada. Esto puede tardar unos segundos. Una vez confirmada
          tendrás acceso completo a todos tus beneficios.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-sm text-emerald-300">Confirmando con el servidor de pagos…</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/chat"
            className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Ir al chat
          </Link>
          <Link
            href="/personajes"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            Ver personajes
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          Si tu plan no se activa en los próximos minutos, contacta soporte desde tu perfil.
        </p>
      </div>
    </section>
  );
}
