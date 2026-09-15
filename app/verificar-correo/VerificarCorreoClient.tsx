"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/BrandLogo";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerificarCorreoClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login?next=/verificar-correo");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await api.verifyEmail(token, code);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado. Inténtalo más tarde.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!token || resendCooldown > 0) return;
    setError(null);
    setInfo(null);
    try {
      const res = await api.resendVerificationCode(token);
      setInfo(res.message);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos reenviar el código. Intenta de nuevo.");
    }
  }

  if (authLoading || !token || !user) {
    return (
      <div className="flex min-h-[calc(100dvh-65px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (user.emailVerified) {
    return (
      <section className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-16 sm:px-6">
        <div className="glass-strong glow-border w-full max-w-md rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold text-white">Tu correo ya está verificado</h1>
          <Link
            href="/dashboard"
            className="glow-button mt-6 inline-block w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Ir al dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-[100px]" />
      </div>

      <div className="glass-strong glow-border w-full max-w-md rounded-2xl p-8">
        <div className="text-center">
          <Link href="/" aria-label="HAREMS — inicio" className="inline-block">
            <BrandLogo variant="vertical" size="md" priority />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Verifica tu correo</h1>
          <p className="mt-2 text-sm text-slate-400">
            Te enviamos un código de 6 dígitos a <span className="text-slate-300">{user.email}</span>.
            Ingrésalo para confirmar tu cuenta.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleVerify}>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Código de verificación</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-lg tracking-[0.3em] text-white placeholder:text-slate-500 placeholder:tracking-normal focus:border-cyan-400/40 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-xs text-red-300">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5 text-xs text-emerald-300">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="glow-button w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Verificando..." : "Verificar"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm text-slate-400">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="font-semibold text-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : "Reenviar código"}
          </button>
          <p>
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-300">
              Verificar más tarde
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
