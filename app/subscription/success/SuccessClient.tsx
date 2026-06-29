"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError, type PlanType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type State = "confirming" | "waiting" | "active" | "timeout" | "error";

const PAID_PLANS: PlanType[] = ["TRIAL_3_DAYS", "PREMIUM", "VIP"];
const MAX_POLL_SECONDS = 90;
const POLL_INTERVAL_MS = 3000;

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const subscriptionId = searchParams.get("subscription_id");

  const [state, setState] = useState<State>("confirming");
  const [activePlan, setActivePlan] = useState<PlanType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    async function confirmAndPoll() {
      // Step 1: confirm with backend
      if (subscriptionId && !confirmedRef.current) {
        confirmedRef.current = true;
        try {
          await api.confirmPayPalSubscription(token!, subscriptionId);
        } catch (err) {
          if (err instanceof ApiError && err.status !== 404) {
            setErrorMsg(err.message);
            setState("error");
            return;
          }
          // 404 = payment not found yet, still poll
        }
      }

      setState("waiting");

      // Step 2: poll subscription status
      pollRef.current = setInterval(async () => {
        elapsedRef.current += POLL_INTERVAL_MS;
        try {
          const sub = await api.getSubscription(token!);
          if (PAID_PLANS.includes(sub.plan)) {
            clearInterval(pollRef.current!);
            setActivePlan(sub.plan);
            setState("active");
            return;
          }
        } catch {
          // ignore polling errors
        }
        if (elapsedRef.current >= MAX_POLL_SECONDS * 1000) {
          clearInterval(pollRef.current!);
          setState("timeout");
        }
      }, POLL_INTERVAL_MS);
    }

    confirmAndPoll();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, subscriptionId]);

  if (state === "error") {
    return (
      <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
        <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Algo salió mal</h1>
          <p className="mt-3 text-sm text-slate-400">{errorMsg}</p>
          <Link href="/planes" className="glow-button mt-8 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white">
            Ver planes
          </Link>
        </div>
      </section>
    );
  }

  if (state === "active") {
    const planLabel = activePlan === "VIP" ? "VIP" : activePlan === "TRIAL_3_DAYS" ? "Pase 3 días" : "Premium";
    return (
      <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
        <div className="glass-strong glow-border mx-auto w-full max-w-md rounded-2xl p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">¡Plan {planLabel} activado!</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Tu suscripción está activa. Ya tienes acceso a todos tus beneficios.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/chat" className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
              Ir al chat
            </Link>
            <Link href="/personajes" className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10">
              Ver personajes
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (state === "timeout") {
    return (
      <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4">
        <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Pago en proceso</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Tu pago fue recibido y estamos confirmando la activación. Puede tomar unos minutos.
            Tu plan se activará automáticamente cuando PayPal confirme el pago.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/chat" className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
              Ir al chat
            </Link>
            <Link href="/planes" className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10">
              Ver planes
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            Si en 10 minutos no ves tu plan activo, contacta soporte.
          </p>
        </div>
      </section>
    );
  }

  // confirming / waiting
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
          Estamos activando tu suscripción. Esto tarda unos segundos.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-sm text-emerald-300">
            {state === "confirming" ? "Confirmando pago con PayPal…" : "Activando tu plan…"}
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/chat" className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
            Ir al chat
          </Link>
          <Link href="/personajes" className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10">
            Ver personajes
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          Si tu plan no se activa en unos minutos, contacta soporte desde tu perfil.
        </p>
      </div>
    </section>
  );
}
