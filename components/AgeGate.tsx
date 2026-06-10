"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "harems_age_verified";

export default function AgeGate() {
  const [status, setStatus] = useState<"checking" | "blocked" | "denied" | "verified">(
    "checking"
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted consent on mount
    setStatus(stored === "true" ? "verified" : "blocked");
  }, []);

  if (status === "checking" || status === "verified") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02030a]/95 p-4 backdrop-blur-2xl">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="glass-strong glow-border w-full max-w-md rounded-2xl p-8 text-center">
        {status === "denied" ? (
          <>
            <h2 className="text-2xl font-bold text-white">Acceso restringido</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              No es posible continuar. HAREMS es una plataforma exclusiva para mayores de
              edad.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-bold text-white">
              18+
            </div>
            <h2 className="text-2xl font-bold text-white">Verificación de edad</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Debes ser mayor de edad para acceder a HAREMS. Esta plataforma contiene
              personajes con personalidades sugerentes destinados exclusivamente a un
              público adulto.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setStatus("denied")}
                className="order-2 flex-1 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 sm:order-1"
              >
                Salir
              </button>
              <button
                onClick={() => {
                  window.localStorage.setItem(STORAGE_KEY, "true");
                  setStatus("verified");
                }}
                className="glow-button order-1 flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 sm:order-2"
              >
                Soy mayor de edad
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
