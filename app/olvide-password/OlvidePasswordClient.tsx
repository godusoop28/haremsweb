"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import BrandLogo from "@/components/BrandLogo";

type Step = "request" | "reset";

export default function OlvidePasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.forgotPassword(email);
      setInfo(res.message);
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado. Inténtalo más tarde.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.resetPassword({ email, code, newPassword });
      router.push("/login?reset=success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado. Inténtalo más tarde.");
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="mt-4 text-2xl font-bold text-white">Recupera tu contraseña</h1>
          <p className="mt-2 text-sm text-slate-400">
            {step === "request"
              ? "Escribe tu correo y te enviaremos un código para restablecerla."
              : "Ingresa el código que recibiste y tu nueva contraseña."}
          </p>
        </div>

        {step === "request" ? (
          <form className="mt-8 space-y-4" onSubmit={handleRequest}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Correo electrónico</label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="glow-button w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleReset}>
            {info && (
              <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5 text-xs text-emerald-300">
                {info}
              </p>
            )}

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

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Nueva contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="glow-button w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Actualizando..." : "Cambiar contraseña"}
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-300"
            >
              ¿No te llegó? Solicitar de nuevo
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
