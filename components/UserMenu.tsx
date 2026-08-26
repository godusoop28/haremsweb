"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { UserResponse } from "@/lib/api";

const planLabels: Record<UserResponse["plan"], string> = {
  FREE: "Gratis",
  TRIAL_3_DAYS: "Pase 3 días",
  PREMIUM: "Premium",
  VIP: "VIP",
};

/** Menú de usuario desktop (avatar + nombre + dropdown) — reemplaza el "Hola, X / Cerrar sesión" fijo. */
export default function UserMenu({
  user,
  onLogout,
}: {
  user: UserResponse;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const firstName = user.name.split(" ")[0];
  const initial = user.name.trim().charAt(0).toUpperCase() || "H";

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-transparent py-1 pl-1 pr-3 text-sm font-medium text-slate-200 transition-colors hover:border-white/10 hover:bg-white/5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="max-w-[110px] truncate">{firstName}</span>
        <svg
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="glass-strong absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="mt-0.5 text-xs text-cyan-300">{planLabels[user.plan]}</p>
          </div>
          <div className="my-1 h-px bg-white/8" />
          <MenuLink href="/dashboard" onClick={() => setOpen(false)}>
            Cuenta
          </MenuLink>
          <MenuLink href="/planes" onClick={() => setOpen(false)}>
            Plan
          </MenuLink>
          <MenuLink href="/dashboard/imagenes" onClick={() => setOpen(false)}>
            Mis imágenes
          </MenuLink>
          <div className="my-1 h-px bg-white/8" />
          <button
            onClick={onLogout}
            role="menuitem"
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-300 transition-colors hover:bg-rose-400/10"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8 hover:text-cyan-300"
    >
      {children}
    </Link>
  );
}
