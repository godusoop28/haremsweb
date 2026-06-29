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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && !ageVerified) {
      setError("Debes confirmar que eres mayor de edad.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        await register({ name, email, password, ageVerified });
      } else {
        await login(email, password);
      }
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
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
            <BrandLogo variant="horizontal" size="md" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Contraseña
            </label>
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
    </section>
  );
}
