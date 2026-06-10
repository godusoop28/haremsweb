import Link from "next/link";
import { plans } from "@/lib/data";

export default function PricingSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Planes para <span className="text-gradient">cada experiencia</span>
          </h2>
          <p className="mt-3 text-slate-400">
            Empieza gratis y mejora cuando quieras desbloquear todo el potencial de
            HAREMS.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.highlighted
                  ? "glass-strong glow-border scale-100 lg:scale-105"
                  : "glass"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-1 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-sm text-slate-400">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/registro"
                className={`mt-8 w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 ${
                  plan.highlighted
                    ? "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                Elegir plan
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
