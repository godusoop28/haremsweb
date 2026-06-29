import type { Metadata } from "next";
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: "Suscripción activada — HAREMS",
};

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
        <div className="glass-strong glow-border mx-auto w-full max-w-md rounded-2xl p-10 text-center">
          <div className="mx-auto mb-5 h-16 w-16 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-slate-400">Cargando…</p>
        </div>
      </section>
    }>
      <SuccessClient />
    </Suspense>
  );
}
