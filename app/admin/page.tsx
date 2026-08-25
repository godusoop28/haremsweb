"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type AdminDashboardResponse, type PlanType, type PaymentStatus } from "@/lib/api";

// Simulación de planes para pruebas — solo visible acá (panel admin), nunca en el dashboard
// del usuario normal. Cambia el plan de LA PROPIA cuenta admin logueada, para poder probar el
// producto como Premium/VIP sin pasar por PayPal. Eliminar cuando ya no haga falta para QA.
const devPlans: { plan: PlanType; label: string }[] = [
  { plan: "FREE", label: "Activar FREE" },
  { plan: "TRIAL_3_DAYS", label: "Activar TRIAL_3_DAYS" },
  { plan: "PREMIUM", label: "Activar PREMIUM" },
  { plan: "VIP", label: "Activar VIP" },
];

const planLabels: Record<PlanType, string> = {
  FREE: "Gratis",
  TRIAL_3_DAYS: "Pase 3 días",
  PREMIUM: "Premium",
  VIP: "VIP",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  CREATED: "Creado",
  PENDING: "Pendiente",
  ACTIVE: "Activo",
  CANCEL_PENDING: "Cancelación pendiente",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspendido",
  PAST_DUE: "Pago atrasado",
  EXPIRED: "Expirado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}

function formatMxn(value: number): string {
  return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

export default function AdminOverviewPage() {
  const { token, user, refresh } = useAuth();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);
  const [planFeedback, setPlanFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getAdminDashboard(token)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el resumen."));
  }, [token]);

  async function handleSimulatePlan(plan: PlanType) {
    if (!token || pendingPlan) return;
    setPendingPlan(plan);
    setPlanFeedback(null);
    try {
      await api.simulateSubscription(token, plan);
      await refresh();
      setPlanFeedback(`Tu cuenta ahora tiene el plan ${plan}.`);
    } catch (err) {
      setPlanFeedback(err instanceof ApiError ? err.message : "No se pudo actualizar el plan.");
    } finally {
      setPendingPlan(null);
    }
  }

  if (error) return <p className="text-sm text-rose-400">{error}</p>;
  if (!data) return <p className="text-sm text-slate-400">Cargando…</p>;

  const plans: PlanType[] = ["FREE", "TRIAL_3_DAYS", "PREMIUM", "VIP"];
  const paymentStatuses = Object.keys(data.paymentsByStatus) as PaymentStatus[];

  return (
    <div>
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-slate-400">
        Los montos de ingresos son un <strong className="text-amber-300">estimado</strong>: se calculan
        multiplicando las suscripciones activas por el precio de lista de cada plan, no son el monto real
        cobrado por PayPal (ese dato no se captura hoy en el sistema).
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingreso mensual estimado" value={formatMxn(data.estimatedMonthlyRevenueMxn)} />
        <StatCard label="Usuarios totales" value={String(data.totalUsers)} sublabel={`${data.activeUsers} activos`} />
        <StatCard label="Nuevos (30 días)" value={String(data.newUsersLast30Days)} />
        <StatCard label="Imágenes generadas" value={String(data.totalImagesGenerated)} />
        <StatCard label="Conversaciones" value={String(data.totalConversations)} />
        <StatCard label="Mensajes enviados" value={String(data.totalMessages)} />
        <StatCard label="Créditos otorgados" value={String(data.totalCreditsGranted)} />
        <StatCard label="Créditos gastados" value={String(data.totalCreditsSpent)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Usuarios y suscripciones por plan</h2>
          <table className="mt-4 w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-slate-400">
                <th className="pb-2">Plan</th>
                <th className="pb-2 text-right">Usuarios</th>
                <th className="pb-2 text-right">Suscripciones activas</th>
                <th className="pb-2 text-right">Ingreso estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {plans.map((plan) => (
                <tr key={plan}>
                  <td className="py-2">{planLabels[plan]}</td>
                  <td className="py-2 text-right font-mono">{data.usersByPlan[plan] ?? 0}</td>
                  <td className="py-2 text-right font-mono">{data.activeSubscriptionsByPlan[plan] ?? 0}</td>
                  <td className="py-2 text-right font-mono text-emerald-400">
                    {formatMxn(data.revenueByPlanMxn[plan] ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Pagos por estado</h2>
          {paymentStatuses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Sin pagos registrados todavía.</p>
          ) : (
            <table className="mt-4 w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-slate-400">
                  <th className="pb-2">Estado</th>
                  <th className="pb-2 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paymentStatuses.map((status) => (
                  <tr key={status}>
                    <td className="py-2">{paymentStatusLabels[status]}</td>
                    <td className="py-2 text-right font-mono">{data.paymentsByStatus[status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 glass rounded-2xl border border-amber-400/20 p-6">
        <h2 className="text-lg font-semibold text-amber-300">Simular plan (QA)</h2>
        <p className="mt-1 text-xs text-slate-400">
          Cambia el plan de tu propia cuenta ({user?.email}) sin pasar por PayPal, para probar el
          producto como Premium/VIP. No afecta a otros usuarios.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {devPlans.map(({ plan, label }) => (
            <button
              key={plan}
              onClick={() => handleSimulatePlan(plan)}
              disabled={pendingPlan !== null}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                user?.plan === plan
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/30"
              }`}
            >
              {pendingPlan === plan ? "Procesando..." : label}
            </button>
          ))}
        </div>
        {planFeedback && <p className="mt-3 text-xs text-slate-400">{planFeedback}</p>}
      </div>
    </div>
  );
}
