"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError, type PlanType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { plans, TRIAL_PLAN_ENABLED } from "@/lib/data";

const planMeta: Record<string, { name: string; price: string; period: string; features: string[] }> = {
  PREMIUM: {
    name: "Premium",
    price: "$199 MXN",
    period: "/ mes",
    features: ["12 personajes desbloqueados", "Chat ilimitado", "30 créditos de imagen/mes", "Normal, Sensual y Sin ropa"],
  },
  VIP: {
    name: "VIP",
    price: "$399 MXN",
    period: "/ mes",
    features: ["Todo Premium incluido", "Victoria Hale desbloqueada", "100 créditos de imagen/mes", "Nivel Explícita desbloqueado"],
  },
  TRIAL_3_DAYS: {
    name: "Pase 3 días",
    price: "$49 MXN",
    period: "/ 3 días",
    features: ["12 personajes por 3 días", "Chat sin límite", "10 créditos de imagen", "Sin renovación automática"],
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = searchParams.get("plan") as PlanType | null;
  const meta = plan ? planMeta[plan] : null;

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-65px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    router.replace(`/login?next=/checkout?plan=${plan}`);
    return null;
  }

  if (!plan || !meta) {
    return (
      <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
        <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
          <p className="text-slate-400">Plan no válido.</p>
          <Link href="/planes" className="mt-6 inline-block text-sm text-cyan-400 hover:underline">
            Ver planes
          </Link>
        </div>
      </section>
    );
  }

  if (plan === "TRIAL_3_DAYS" && !TRIAL_PLAN_ENABLED) {
    return (
      <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
        <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
          <p className="text-white font-semibold">Este plan todavía no está disponible</p>
          <p className="mt-2 text-sm text-slate-400">
            El Pase 3 días estará disponible pronto. Por ahora puedes elegir Premium o VIP.
          </p>
          <Link href="/planes" className="mt-6 inline-block text-sm text-cyan-400 hover:underline">
            Ver planes disponibles
          </Link>
        </div>
      </section>
    );
  }

  async function handleCheckout() {
    if (!token || !plan) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.createPayPalSubscription(token, plan);
      window.location.href = response.approvalUrl;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 503) {
          setError("Este plan todavía no está configurado en el sistema. Contacta a soporte o intenta más tarde.");
        } else {
          setError(err.message);
        }
      } else {
        setError("No pudimos iniciar PayPal. Intenta de nuevo.");
      }
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4 py-16">
      <div className="glass-strong glow-border mx-auto w-full max-w-md rounded-2xl p-10">
        <div className="text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-cyan-300">
            Pago seguro · PayPal
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Plan {meta.name}
          </h1>
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold text-white">{meta.price}</span>
            <span className="text-sm text-slate-400">{meta.period}</span>
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {meta.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {error && (
          <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="glow-button mt-8 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Redirigiendo a PayPal…
            </span>
          ) : (
            "Pagar con PayPal"
          )}
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Serás redirigido a PayPal para completar el pago de forma segura.
        </p>

        <div className="mt-6 text-center">
          <Link href="/planes" className="text-xs text-slate-400 hover:text-slate-300">
            ← Volver a planes
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100dvh-65px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
