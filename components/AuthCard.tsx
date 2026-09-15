"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/BrandLogo";

interface AuthCardProps {
  mode: "login" | "register";
  title: string;
  subtitle: string;
  submitLabel: string;
  showName?: boolean;
  switchHref: string;
  switchPrompt: string;
  switchLabel: string;
}

export default function AuthCard(props: AuthCardProps) {
  return (
    <Suspense fallback={null}>
      <AuthCardInner {...props} />
    </Suspense>
  );
}

function AuthCardInner({
  mode,
  title,
  subtitle,
  submitLabel,
  showName,
  switchHref,
  switchPrompt,
  switchLabel,
}: AuthCardProps) {
  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const passwordResetSuccess = mode === "login" && searchParams.get("reset") === "success";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && !ageVerified) {
      setError("Debes confirmar que eres mayor de edad.");
      return;
    }

    setSubmitting(true);
    try {
      const next = searchParams.get("next");
      const fallback = next && next.startsWith("/") ? next : "/dashboard";

      if (mode === "register") {
        const registeredUser = await register({ name, email, password, ageVerified });
        // Modo "suave": el usuario ya queda logueado (register() ya guardó el token). Si su
        // correo no quedó verificado, lo llevamos a la pantalla de verificación como siguiente
        // paso natural, pero no lo bloqueamos — puede navegar a otro lado libremente.
        router.push(registeredUser.emailVerified ? fallback : "/verificar-correo");
      } else {
        await login(email, password);
        router.push(fallback);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado. Inténtalo más tarde.");
    } finally {
      setSubmitting(false);
    }
  }

  const benefits = [
    "16 personalidades IA con conexión progresiva",
    "Conversaciones privadas, disponibles día y noche",
    "Imágenes personalizadas en los planes Premium y VIP",
  ];

  return (
    <section className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-[100px]" />
      </div>

      <div className="flex w-full max-w-4xl items-stretch gap-8">
        {/* Panel de marca/beneficios — solo desktop, la tarjeta de formulario ya es autosuficiente en mobile. */}
        <div className="hidden w-full max-w-sm flex-col justify-center lg:flex">
          <Link href="/" aria-label="HAREMS — inicio" className="inline-block">
            <BrandLogo variant="horizontal" size="md" priority />
          </Link>
          <p className="mt-6 text-2xl font-semibold leading-snug text-white">
            Conversa. Conecta. <span className="text-gradient">Crea.</span>
          </p>
          <ul className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-400">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-strong glow-border w-full max-w-md shrink-0 rounded-2xl p-8">
          <div className="text-center lg:hidden">
            <Link href="/" aria-label="HAREMS — inicio" className="inline-block">
              <BrandLogo variant="vertical" size="md" priority />
            </Link>
          </div>
          <div className="text-center">
            <h1 className="mt-4 text-2xl font-bold text-white lg:mt-0">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {passwordResetSuccess && (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5 text-xs text-emerald-300">
              Tu contraseña se actualizó correctamente. Inicia sesión con tu nueva contraseña.
            </p>
          )}
          {showName && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-400">
                Contraseña
              </label>
              {mode === "login" && (
                <Link href="/olvide-password" className="text-xs font-medium text-cyan-300 hover:text-cyan-200">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
            />
          </div>

          {showName && (
            <label className="flex items-start gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                className="mt-0.5 accent-cyan-400"
              />
              Confirmo que soy mayor de edad y acepto los términos de uso.
            </label>
          )}

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
            {submitting ? "Procesando..." : submitLabel}
          </button>
        </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {switchPrompt}{" "}
            <Link href={switchHref} className="font-semibold text-cyan-300 hover:text-cyan-200">
              {switchLabel}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
