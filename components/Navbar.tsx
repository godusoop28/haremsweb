"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/BrandLogo";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/personajes", label: "Personajes" },
  { href: "/planes", label: "Planes" },
  { href: "/chat", label: "Chat demo" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05070d]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)} aria-label="Ir al inicio — HAREMS">
          {/* Desktop: logo horizontal completo */}
          <BrandLogo variant="horizontal" size="md" className="hidden sm:block" />
          {/* Mobile: solo emblema */}
          <BrandLogo variant="emblem" size="md" className="sm:hidden" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-cyan-300"
            >
              Mi cuenta
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              <span className="text-sm font-medium text-slate-400">
                Hola, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition-transform hover:scale-105"
              >
                Cerrar sesión
              </button>
            </>
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
                Empezar
              </Link>
            </>
          )}
        </div>

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

      {open && (
        <div className="border-t border-white/5 bg-[#05070d]/95 px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-300"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-300"
                >
                  Mi cuenta
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
                  Empezar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
