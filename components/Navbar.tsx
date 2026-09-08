"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/BrandLogo";
import UserMenu from "@/components/UserMenu";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/personajes", label: "Personajes" },
  { href: "/planes", label: "Planes" },
];

const authenticatedLinks = [
  { href: "/", label: "Inicio" },
  { href: "/personajes", label: "Personajes" },
  { href: "/chat", label: "Chat" },
  { href: "/dashboard/imagenes", label: "Galería" },
  { href: "/planes", label: "Planes" },
  { href: "/creditos", label: "Créditos" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const links = user ? authenticatedLinks : publicLinks;

  function handleLogout() {
    logout();
    setOpen(false);
    // Cierra sesión → limpia todo estado privado y vuelve a la home pública (test 84).
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05070d]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)} aria-label="Ir al inicio — HAREMS">
          <BrandLogo variant="horizontal" size="sm" priority className="hidden sm:block" />
          <BrandLogo variant="emblem" size="sm" priority className="sm:hidden" />
        </Link>

        {/* Mientras se resuelve la sesión no mostramos ni la navbar pública ni la autenticada —
            un skeleton neutro evita el parpadeo público→privado (test 79). */}
        {loading ? (
          <div className="hidden items-center gap-8 md:flex" aria-hidden="true">
            <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
            <div className="h-9 w-24 animate-pulse rounded-full bg-white/5" />
          </div>
        ) : (
          <>
            <div className="hidden items-center gap-7 md:flex">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-1 text-sm font-medium transition-colors ${
                      active ? "text-white" : "text-slate-300 hover:text-cyan-300"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute -bottom-[13px] left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-300 transition-colors hover:text-cyan-300"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="glow-button rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-2 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 top-2 h-0.5 w-5 bg-current transition-all ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-2 -rotate-45" : "top-4"}`}
            />
          </span>
        </button>
      </nav>

      {open && !loading && (
        <div className="border-t border-white/5 bg-[#05070d]/95 px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-white/5 text-cyan-300" : "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-300"
                >
                  Cuenta
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-center text-sm font-semibold text-slate-200"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-300"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className="glow-button mt-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
