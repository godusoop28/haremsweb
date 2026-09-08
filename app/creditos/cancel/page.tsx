import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pago cancelado — HAREMS",
};

export default function CreditosCancelPage() {
  return (
    <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
      <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Pago cancelado</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          No se realizó ningún cargo. Puedes intentar de nuevo cuando quieras.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/creditos" className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
            Volver a créditos
          </Link>
          <Link href="/dashboard" className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10">
            Ir al dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
