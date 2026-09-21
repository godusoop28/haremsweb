"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { plans, TRIAL_PLAN_ENABLED } from "@/lib/data";
import { api, ApiError, type PlanType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/** Planes pagados entre los que se puede cambiar sin crear una suscripción nueva (ver revisePayPalSubscription). */
const PAID_PLANS: PlanType[] = ["PREMIUM", "VIP"];

const planCheckoutId: Record<string, string> = {
  trial: "TRIAL_3_DAYS",
  premium: "PREMIUM",
  vip: "VIP",
};

function formatMxn(amount: number): string {
  return amount === 0 ? "$0" : `$${amount} MXN`;
}

export default function PricingSection() {
  const { user, token } = useAuth();
  // Precio en vivo desde el backend (misma fuente que usa el panel de admin para estimar
  // ingresos) — evita que este componente y el backend se desincronicen con el tiempo. Si el
  // fetch falla o todavía no llegó, se muestra el precio estático de lib/data.ts como fallback.
  const [livePrices, setLivePrices] = useState<Partial<Record<PlanType, string>> | null>(null);
  const [liveOriginalPrices, setLiveOriginalPrices] = useState<Partial<Record<PlanType, string>>>({});
  // Cambio de plan entre pagados (PREMIUM<->VIP) — usa revise sobre la suscripción existente en
  // vez de /checkout, que crearía una segunda suscripción de PayPal en paralelo y cobraría doble.
  const [revisingPlan, setRevisingPlan] = useState<PlanType | null>(null);
  const [reviseError, setReviseError] = useState<string | null>(null);

  async function handleRevise(newPlan: PlanType) {
    if (!token) return;
    setReviseError(null);
    setRevisingPlan(newPlan);
    try {
      const response = await api.revisePayPalSubscription(token, newPlan);
      if (response.approvalUrl) {
        // eslint-disable-next-line react-hooks/immutability -- redirect de navegador estándar, no estado de React
        window.location.href = response.approvalUrl;
        return;
      }
      // Se aplicó sin necesitar re-aprobación — ya quedó activo, solo recargar para reflejarlo.
      // eslint-disable-next-line react-hooks/immutability -- redirect de navegador estándar, no estado de React
      window.location.href = "/dashboard";
    } catch (err) {
      setReviseError(err instanceof ApiError ? err.message : "No se pudo cambiar de plan. Intenta de nuevo.");
      setRevisingPlan(null);
    }
  }

  useEffect(() => {
    api
      .getPlans()
      .then((remotePlans) => {
        const map: Partial<Record<PlanType, string>> = {};
        const originalMap: Partial<Record<PlanType, string>> = {};
        remotePlans.forEach((p) => {
          map[p.plan] = formatMxn(p.priceMxn);
          if (p.originalPriceMxn != null) {
            originalMap[p.plan] = formatMxn(p.originalPriceMxn);
          }
        });
        setLivePrices(map);
        setLiveOriginalPrices(originalMap);
      })
      .catch(() => {});
  }, []);

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

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const checkoutPlan = planCheckoutId[plan.id];
            const isFreePlan = plan.id === "free";
            const isTrialPlan = plan.id === "trial";
            const isTrialDisabled = isTrialPlan && !TRIAL_PLAN_ENABLED;
            const userPlanKey = isTrialPlan ? "TRIAL_3_DAYS" : (plan.id.toUpperCase() as PlanType);
            const currentPlanActive = user?.plan === userPlanKey;
            // Ya tiene un plan pagado activo y quiere otro plan pagado (PREMIUM<->VIP) — cambia
            // la suscripción existente (revise) en vez de crear una nueva y pagar doble.
            const canRevise =
              !!user && !currentPlanActive && PAID_PLANS.includes(user.plan) && PAID_PLANS.includes(userPlanKey as PlanType);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  plan.highlighted
                    ? "glass-strong glow-border scale-100 lg:scale-105"
                    : plan.id === "vip"
                      ? "glass border-amber-300/20"
                      : "glass"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    Más popular
                  </span>
                )}
                {plan.id === "vip" && (
                  <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-300/15 px-4 py-1 text-xs font-semibold text-amber-200 ring-1 ring-inset ring-amber-300/30">
                    Exclusivo
                  </span>
                )}

                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                {(liveOriginalPrices[userPlanKey as PlanType] ?? plan.originalPrice) && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-slate-500 line-through">
                      {liveOriginalPrices[userPlanKey as PlanType] ?? plan.originalPrice}
                    </span>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                      Oferta
                    </span>
                  </div>
                )}
                <div className={`flex items-baseline gap-1 ${(liveOriginalPrices[userPlanKey as PlanType] ?? plan.originalPrice) ? "mt-1" : "mt-3"}`}>
                  <span className="text-4xl font-extrabold text-white">
                    {livePrices?.[userPlanKey as PlanType] ?? plan.price}
                  </span>
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

                {isFreePlan ? (
                  <Link
                    href={user ? "/chat" : "/registro"}
                    className="mt-8 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
                  >
                    {user ? "Ir al chat" : "Registrarse gratis"}
                  </Link>
                ) : isTrialDisabled ? (
                  <div className="mt-8 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-slate-500 cursor-not-allowed">
                    Próximamente
                  </div>
                ) : currentPlanActive ? (
                  <div className="mt-8 w-full rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-center text-sm font-semibold text-emerald-300">
                    Plan actual
                  </div>
                ) : canRevise ? (
                  <>
                    <button
                      onClick={() => handleRevise(userPlanKey as PlanType)}
                      disabled={revisingPlan !== null}
                      className={`mt-8 w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
                        plan.highlighted
                          ? "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                          : "border border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      {revisingPlan === userPlanKey
                        ? "Redirigiendo a PayPal…"
                        : plan.id === "vip"
                          ? "Subir a VIP"
                          : "Bajar a Premium"}
                    </button>
                    {reviseError && revisingPlan === null && (
                      <p className="mt-2 text-center text-xs text-red-400">{reviseError}</p>
                    )}
                  </>
                ) : user ? (
                  <Link
                    href={`/checkout?plan=${checkoutPlan}`}
                    className={`mt-8 w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 ${
                      plan.highlighted
                        ? "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                        : "border border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    {user.plan === "FREE" ? `Elegir ${plan.name}` : "Pagar con PayPal"}
                  </Link>
                ) : (
                  <Link
                    href={`/registro`}
                    className={`mt-8 w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 ${
                      plan.highlighted
                        ? "glow-button bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                        : "border border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    Crear cuenta
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
