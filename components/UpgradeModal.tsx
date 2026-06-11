"use client";

import Link from "next/link";

interface UpgradeModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function UpgradeModal({ title, message, onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#02030a]/80 p-4 backdrop-blur-md">
      <div className="glass-strong glow-border w-full max-w-sm rounded-2xl p-7 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="order-2 flex-1 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 sm:order-1"
          >
            Cerrar
          </button>
          <Link
            href="/planes"
            className="glow-button order-1 flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 sm:order-2"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </div>
  );
}
