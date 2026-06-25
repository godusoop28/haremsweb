import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pago pendiente — HAREMS",
};

export default function SubscriptionPendingPage() {
  return (
    <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
      <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white">Pago en proceso</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Tu pago está siendo procesado por PayPal. Una vez confirmado, tu suscripción se
          activará automáticamente y recibirás acceso completo.
        </p>

        <div className="mt-6 space-y-2 text-left text-sm text-slate-400">
          <div className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            Esto puede tardar entre 1 y 5 minutos.
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            No necesitas hacer nada — el sistema se actualiza solo.
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            Si en 10 minutos no ves tu plan activo, contacta soporte.
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/chat"
            className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Ir al chat
          </Link>
          <Link
            href="/planes"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
}
