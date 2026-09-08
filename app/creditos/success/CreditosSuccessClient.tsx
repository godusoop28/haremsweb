"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError, type CreditPurchaseResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type State = "capturing" | "completed" | "error" | "needs-login";

function CreditosSuccessContent() {
  const searchParams = useSearchParams();
  const { token, loading } = useAuth();
  // PayPal Orders API v2 devuelve el orderId como `token` en la URL de retorno.
  const orderId = searchParams.get("token");

  const [state, setState] = useState<State>("capturing");
  const [purchase, setPurchase] = useState<CreditPurchaseResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const capturedRef = useRef(false);

  // URL de retorno para volver aquí después de iniciar sesión y capturar la orden.
  const loginHref = orderId
    ? `/login?next=${encodeURIComponent(`/creditos/success?token=${orderId}`)}`
    : "/login";

  useEffect(() => {
    // Espera a que el contexto de auth termine de hidratar antes de decidir.
    if (loading || !orderId) return;

    if (!token) {
      setState("needs-login");
      return;
    }

    if (capturedRef.current) return;
    capturedRef.current = true;

    api
      .captureCreditOrder(token, orderId)
      .then((res) => {
        setPurchase(res);
        setState("completed");
      })
      .catch((err) => {
        setErrorMsg(err instanceof ApiError ? err.message : "No se pudo confirmar el pago.");
        setState("error");
      });
  }, [token, loading, orderId]);

  if (!orderId) {
    return (
      <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <p className="text-slate-400">No encontramos la orden de pago.</p>
        <Link href="/creditos" className="mt-6 inline-block text-sm text-cyan-400 hover:underline">
          Volver a créditos
        </Link>
      </div>
    );
  }

  if (state === "needs-login") {
    return (
      <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Necesitas iniciar sesión para confirmar tus créditos.</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Tu pago con PayPal se registró. Inicia sesión con la misma cuenta y volveremos a esta página
          para agregar tus créditos automáticamente.
        </p>
        <Link
          href={loginHref}
          className="glow-button mt-8 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="glass-strong mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">No se pudo confirmar el pago</h1>
        <p className="mt-3 text-sm text-slate-400">{errorMsg}</p>
        <Link href="/creditos" className="glow-button mt-8 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white">
          Volver a créditos
        </Link>
      </div>
    );
  }

  if (state === "completed" && purchase) {
    return (
      <div className="glass-strong glow-border mx-auto w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Créditos agregados correctamente</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Se agregaron {purchase.credits} créditos extra a tu cuenta.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/chat" className="glow-button flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
            Ir al chat
          </Link>
          <Link href="/dashboard" className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10">
            Ver dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong glow-border mx-auto w-full max-w-md rounded-2xl p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">Confirmando tu pago…</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        Estamos confirmando el pago con PayPal y agregando tus créditos.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="text-sm text-emerald-300">Procesando…</span>
      </div>
    </div>
  );
}

export default function CreditosSuccessClient() {
  return (
    <section className="flex min-h-[calc(100dvh-65px)] items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        }
      >
        <CreditosSuccessContent />
      </Suspense>
    </section>
  );
}
