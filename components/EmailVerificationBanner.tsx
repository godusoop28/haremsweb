"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

/** Aviso discreto y NO bloqueante — el usuario puede seguir usando la app sin verificar su correo. */
export default function EmailVerificationBanner() {
  const { user } = useAuth();

  if (!user || user.emailVerified) return null;

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-3.5 text-sm sm:flex-row sm:items-center">
      <p className="text-amber-200">
        Aún no has verificado tu correo <span className="font-medium">{user.email}</span>.
      </p>
      <Link
        href="/verificar-correo"
        className="shrink-0 rounded-full border border-amber-400/30 px-4 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/10"
      >
        Verificar ahora
      </Link>
    </div>
  );
}
