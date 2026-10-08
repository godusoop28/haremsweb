import type { Metadata } from "next";
import PricingSection from "@/components/PricingSection";
import { FREE_MESSAGES_PER_CHARACTER, FREE_TRIAL_NAMES_TEXT } from "@/lib/data";

export const metadata: Metadata = {
  title: "Planes — HAREMS",
};

export default function PlanesPage() {
  return (
    <section className="px-4 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300">
          Cancela cuando quieras · Sin contratos
        </span>
        <h1 className="mt-5 text-3xl font-bold text-white sm:text-5xl">
          Desbloquea la experiencia <span className="text-gradient">completa</span>
        </h1>
        <p className="mt-4 text-slate-400">
          Gratis tienes {FREE_MESSAGES_PER_CHARACTER} mensajes con {FREE_TRIAL_NAMES_TEXT} cada una. Con un
          plan conversas con todas las chicas, les pides fotos y tienes hasta 2000 mensajes al mes con VIP.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Pago seguro por PayPal
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Cancela en cualquier momento
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Solo personajes ficticios adultos (+18)
          </span>
        </div>
      </div>
      <PricingSection />
    </section>
  );
}
