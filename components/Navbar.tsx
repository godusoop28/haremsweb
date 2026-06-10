"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Inicio", num: "01" },
  { href: "/personajes", label: "Personajes", num: "02" },
  { href: "/planes", label: "Planes", num: "03" },
  { href: "/chat", label: "Chat demo", num: "04" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05070d]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="text-xl font-bold tracking-tight text-white">
            HARE<span className="text-gradient">MS</span>
          </span>
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
        </div>

        <div className="hidden items-center gap-3 md:flex">
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
        </div>

        {/* Distinctive mobile trigger: glowing orb with a pulsing core */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/25 bg-white/5 text-cyan-200 shadow-[0_0_18px_-6px_rgba(34,211,238,0.7)] transition-transform active:scale-95 md:hidden"
        >
          <span className="absolute h-2 w-2 animate-pulse-glow rounded-full bg-cyan-400" />
          <span className="absolute h-7 w-7 rounded-full border border-cyan-400/30" />
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </nav>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-[#03050b]/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in side drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-[78%] max-w-xs flex-col border-l border-cyan-400/15 bg-[#05070d] shadow-[-12px_0_40px_-15px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-16 top-[-10%] h-56 w-56 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -left-16 bottom-[10%] h-56 w-56 rounded-full bg-cyan-400/15 blur-[100px]" />

        <div className="relative flex h-full flex-col overflow-y-auto px-5 pb-6 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold tracking-tight text-white">
              HARE<span className="text-gradient">MS</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-transform active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all hover:border-cyan-400/20 hover:bg-white/5"
                style={{
                  transitionDelay: open ? `${i * 50}ms` : "0ms",
                  transform: open ? "translateX(0)" : "translateX(16px)",
                  opacity: open ? 1 : 0,
                  transitionProperty: "transform, opacity",
                  transitionDuration: "350ms",
                }}
              >
                <span className="text-[11px] font-mono text-cyan-400/60">{link.num}</span>
                <span className="text-base font-semibold text-slate-100 transition-colors group-hover:text-cyan-300">
                  {link.label}
                </span>
                <span className="ml-auto text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="glass-strong rounded-full px-5 py-2.5 text-center text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-300"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              onClick={() => setOpen(false)}
              className="glow-button rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Empezar ahora
            </Link>
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-500">
            Plataforma privada · Acceso 18+
          </p>
        </div>
      </div>
    </header>
  );
}
