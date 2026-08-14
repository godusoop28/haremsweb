"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type AdminImageGenerationResponse } from "@/lib/api";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-400/15 text-emerald-300",
  PENDING: "bg-cyan-400/15 text-cyan-300",
  PROCESSING: "bg-cyan-400/15 text-cyan-300",
  FAILED: "bg-rose-400/15 text-rose-300",
  BLOCKED: "bg-amber-400/15 text-amber-300",
};

function formatCost(costUsd: number | null): string {
  if (costUsd == null) return "—";
  return `$${costUsd.toFixed(4)} USD`;
}

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AdminImagesPage() {
  const { token } = useAuth();
  const [generations, setGenerations] = useState<AdminImageGenerationResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getAdminImageGenerations(token)
      .then(setGenerations)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudieron cargar las generaciones."));
  }, [token]);

  const filtered = useMemo(() => {
    return generations.filter((g) => {
      if (statusFilter && g.status !== statusFilter) return false;
      if (emailFilter && !g.userEmail.toLowerCase().includes(emailFilter.trim().toLowerCase())) return false;
      return true;
    });
  }, [generations, statusFilter, emailFilter]);

  const statuses = useMemo(() => Array.from(new Set(generations.map((g) => g.status))), [generations]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Filtrar por correo…"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{filtered.length} generaciones</span>
      </div>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full min-w-[1100px] text-xs text-slate-300">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-slate-400">
              <th className="p-3">Usuario</th>
              <th className="p-3">Personaje</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Proveedor</th>
              <th className="p-3">Modelo</th>
              <th className="p-3 text-right">Costo real</th>
              <th className="p-3 text-right">Créditos</th>
              <th className="p-3">Referencia</th>
              <th className="p-3 text-right">Duración</th>
              <th className="p-3">Error</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((g) => (
              <tr key={g.id}>
                <td className="p-3">{g.userEmail}</td>
                <td className="p-3">{g.characterSlug}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${statusStyles[g.status] ?? "bg-slate-500/20 text-slate-400"}`}>
                    {g.status}
                  </span>
                </td>
                <td className="p-3">{g.provider}</td>
                <td className="p-3">{g.model ?? "—"}</td>
                <td className="p-3 text-right font-mono">{formatCost(g.costUsd)}</td>
                <td className="p-3 text-right font-mono">{g.creditsCost}</td>
                <td className="p-3">
                  {g.usedReferenceImage ? (g.usedPulid ? "PuLID" : "img2img") : "—"}
                </td>
                <td className="p-3 text-right font-mono">{formatDuration(g.durationMs)}</td>
                <td className="p-3 max-w-[200px] truncate" title={g.errorMessage ?? undefined}>
                  {g.errorCode ?? "—"}
                </td>
                <td className="p-3 text-slate-500">
                  {new Date(g.createdAt).toLocaleString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="p-6 text-center text-slate-400">
                  Sin generaciones que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
