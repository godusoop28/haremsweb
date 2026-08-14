"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  ApiError,
  type AdminUserResponse,
  type CreditTransactionResponse,
  type CreditTransactionType,
} from "@/lib/api";

const typeLabels: Record<CreditTransactionType, string> = {
  GRANT: "Otorgado",
  SPEND: "Gastado",
  REFUND: "Reembolso",
  ADJUSTMENT: "Ajuste",
  EXPIRE: "Expirado",
  REVERSAL: "Reversión",
};

function AdjustCreditsForm({ users, onAdjusted }: { users: AdminUserResponse[]; onAdjusted: () => void }) {
  const { token } = useAuth();
  const [userId, setUserId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || userId === "" || !amount || !reason.trim() || status === "saving") return;
    setStatus("saving");
    setFeedback(null);
    try {
      await api.adjustAdminCredits(token, { userId: Number(userId), amount: Number(amount), reason: reason.trim() });
      setFeedback("Ajuste aplicado.");
      setAmount("");
      setReason("");
      onAdjusted();
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "No se pudo aplicar el ajuste.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-white">Ajustar créditos</h2>
      <p className="mt-1 text-xs text-slate-500">
        Cantidad positiva otorga créditos, negativa los descuenta (no puede dejar el balance en negativo).
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1.5fr_0.7fr_1.5fr_auto]">
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : "")}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        >
          <option value="">Selecciona un usuario…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email} (créditos extra: {u.imageCredits})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="±cantidad"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        />
        <input
          placeholder="Motivo"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "Aplicando..." : "Aplicar"}
        </button>
      </div>
      {feedback && <p className="mt-2 text-xs text-slate-400">{feedback}</p>}
    </form>
  );
}

export default function AdminCreditsPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [transactions, setTransactions] = useState<CreditTransactionResponse[]>([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<CreditTransactionType | "">("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getAdminUsers(token).then(setUsers).catch(() => {});
  }, [token]);

  function loadTransactions() {
    if (!token) return;
    api
      .getAdminCreditTransactions(token, {
        email: emailFilter.trim() || undefined,
        type: typeFilter || undefined,
        page,
        size: 25,
      })
      .then((res) => {
        setTransactions(res.content);
        setTotalPages(res.totalPages);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el historial."));
  }

  // Los filtros de email/tipo se aplican explícitamente con el botón "Filtrar",
  // no en cada tecleo — por eso no son dependencias de este efecto.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadTransactions, [token, page]);

  return (
    <div className="space-y-6">
      <AdjustCreditsForm users={users} onAdjusted={loadTransactions} />

      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white">Historial de créditos</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            placeholder="Filtrar por email…"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CreditTransactionType | "")}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setPage(0);
              loadTransactions();
            }}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400/30"
          >
            Filtrar
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="pb-2 pr-4">Fecha</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2 pr-4 text-right">Cantidad</th>
                <th className="pb-2 pr-4 text-right">Saldo</th>
                <th className="pb-2">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2 pr-4 text-slate-400">
                    {new Date(tx.createdAt).toLocaleString("es-MX")}
                  </td>
                  <td className="py-2 pr-4">{typeLabels[tx.type]}</td>
                  <td
                    className={`py-2 pr-4 text-right font-mono font-semibold ${
                      tx.type === "SPEND" || tx.type === "EXPIRE" ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {tx.type === "SPEND" || tx.type === "EXPIRE" ? "-" : "+"}
                    {tx.amount}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono">{tx.balanceAfter}</td>
                  <td className="py-2 max-w-[240px] truncate" title={tx.reason}>
                    {tx.reason}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Sin transacciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-full border border-white/10 px-3 py-1 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span>
              Página {page + 1} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-white/10 px-3 py-1 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
