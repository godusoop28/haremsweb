"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/creditos", label: "Créditos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!token || user?.role !== "ADMIN")) {
      router.replace("/dashboard");
    }
  }, [loading, token, user, router]);

  if (loading || !token || user?.role !== "ADMIN") {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">Cargando...</div>
      </section>
    );
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">
            Panel de <span className="text-gradient">administración</span>
          </h1>
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-cyan-300">
            ← Volver a mi cuenta
          </Link>
        </div>
        <nav className="mt-5 flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
