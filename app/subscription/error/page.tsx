import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Error en el pago — HAREMS",
};

export default function SubscriptionErrorPage() {
  return (
    <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
      <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white">Error en el pago</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Ocurrió un problema durante el proceso de pago. No se realizó ningún cargo.
          Por favor intenta de nuevo o elige otro método de pago.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/planes"
            className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Intentar de nuevo
          </Link>
          <Link
            href="/chat"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            Ir al chat
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          Si el problema persiste, contacta soporte desde tu perfil.
        </p>
      </div>
    </section>
  );
}
