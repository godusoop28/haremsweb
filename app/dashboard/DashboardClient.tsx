"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { characters } from "@/lib/data";
import {
  api,
  ApiError,
  type ConversationResponse,
  type SubscriptionResponse,
  type CharacterResponse,
  type PlanType,
  type CreditTransactionResponse,
  type CreditTransactionType,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const planLabels: Record<PlanType, string> = {
  FREE: "Gratis",
  TRIAL_3_DAYS: "Pase 3 días",
  PREMIUM: "Premium",
  VIP: "VIP",
};

const statusLabels: Record<SubscriptionResponse["status"], string> = {
  ACTIVE: "Activa",
  EXPIRED: "Expirada",
  CANCELLED: "Cancelada",
};

// Botones temporales para pruebas de planes. Eliminar cuando se integren pagos reales.
const devPlans: { plan: PlanType; label: string }[] = [
  { plan: "FREE", label: "Activar FREE" },
  { plan: "TRIAL_3_DAYS", label: "Activar TRIAL_3_DAYS" },
  { plan: "PREMIUM", label: "Activar PREMIUM" },
  { plan: "VIP", label: "Activar VIP" },
];

function CreditTypeBadge({ type }: { type: CreditTransactionType }) {
  const styles: Record<CreditTransactionType, string> = {
    GRANT: "bg-emerald-400/15 text-emerald-300",
    SPEND: "bg-rose-400/15 text-rose-300",
    REFUND: "bg-cyan-400/15 text-cyan-300",
    ADJUSTMENT: "bg-amber-400/15 text-amber-300",
    EXPIRE: "bg-slate-400/15 text-slate-400",
    REVERSAL: "bg-purple-400/15 text-purple-300",
  };
  const labels: Record<CreditTransactionType, string> = {
    GRANT: "Otorgado",
    SPEND: "Gastado",
    REFUND: "Reembolso",
    ADJUSTMENT: "Ajuste",
    EXPIRE: "Expirado",
    REVERSAL: "Reversión",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function friendlyReason(reason: string): string {
  const map: Record<string, string> = {
    SUBSCRIPTION_ACTIVATED_PREMIUM: "Suscripción Premium",
    SUBSCRIPTION_ACTIVATED_VIP: "Suscripción VIP",
    SUBSCRIPTION_ACTIVATED_TRIAL_3_DAYS: "Pase 3 días",
    PLAN_DOWNGRADE_TO_FREE: "Downgrade a Free",
  };
  if (map[reason]) return map[reason];
  if (reason.startsWith("IMAGE_GENERATION:")) return "Imagen generada";
  if (reason.startsWith("IMAGE_BLOCKED_BY_PROVIDER:")) return "Imagen bloqueada (reembolso)";
  if (reason.startsWith("IMAGE_GENERATION_FAILED:")) return "Error de imagen (reembolso)";
  if (reason.startsWith("ADMIN_ADJUST:")) return "Ajuste admin";
  return reason;
}

const planRank: Record<PlanType, number> = {
  FREE: 0,
  TRIAL_3_DAYS: 1,
  PREMIUM: 1,
  VIP: 2,
};

const accessRank: Record<CharacterResponse["accessType"], number> = {
  FREE: 0,
  PREMIUM: 1,
  VIP: 2,
};

export default function DashboardClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [remoteCharacters, setRemoteCharacters] = useState<CharacterResponse[]>([]);
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);
  const [planFeedback, setPlanFeedback] = useState<string | null>(null);
  const [cancelPending, setCancelPending] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditTransactionResponse[]>([]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login?next=/dashboard");
    }
  }, [authLoading, token, router]);

  const loadSubscription = useCallback(() => {
    if (!token) return;
    api.getSubscription(token).then(setSubscription).catch(() => {});
  }, [token]);

  useEffect(() => {
    loadSubscription();
    if (!token) return;
    api.getConversations(token).then(setConversations).catch(() => {});
    api.getCharacters().then(setRemoteCharacters).catch(() => {});
    api.getCreditTransactions(token, 0, 10)
      .then((page) => setCreditHistory(page.content))
      .catch(() => {});
  }, [token, loadSubscription]);

  async function handleCancelSubscription() {
    if (!token || cancelPending) return;
    setCancelPending(true);
    setCancelFeedback(null);
    try {
      await api.cancelPayPalSubscription(token);
      await refresh();
      loadSubscription();
      setCancelFeedback("Suscripción cancelada. Tu acceso estará activo hasta la fecha de vencimiento.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No se pudo cancelar la suscripción.";
      setCancelFeedback(msg);
    } finally {
      setCancelPending(false);
    }
  }

  async function handleSimulatePlan(plan: PlanType) {
    if (!token || pendingPlan) return;
    setPendingPlan(plan);
    setPlanFeedback(null);
    try {
      await api.simulateSubscription(token, plan);
      await refresh();
      loadSubscription();
      setPlanFeedback(`Plan actualizado a ${planLabels[plan]}.`);
    } catch (err) {
      setPlanFeedback(
        err instanceof ApiError ? err.message : "No se pudo actualizar el plan."
      );
    } finally {
      setPendingPlan(null);
    }
  }

  if (authLoading || !token || !user) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-slate-400">Cargando...</div>
      </section>
    );
  }

  const availableCharacters = characters.filter((c) => {
    const remote = remoteCharacters.find((r) => r.slug === c.id);
    if (!remote) return !c.isPremium;
    return planRank[user.plan] >= accessRank[remote.accessType];
  });

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Hola, <span className="text-gradient">{user.name.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">{user.email}</p>
          </div>
          <Link
            href="/planes"
            className="glow-button rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Mejorar plan
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Plan actual
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{planLabels[user.plan]}</p>
            {subscription && (
              <p className="mt-1 text-xs text-slate-400">
                {statusLabels[subscription.status]}
                {subscription.expiresAt &&
                  ` · vence ${new Date(subscription.expiresAt).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}`}
              </p>
            )}
            {subscription?.status === "ACTIVE" && user.plan !== "FREE" && (
              <div className="mt-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelPending}
                  className="text-xs text-rose-400 underline underline-offset-2 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelPending ? "Cancelando…" : "Cancelar suscripción"}
                </button>
                {cancelFeedback && (
                  <p className="mt-1 text-xs text-slate-400">{cancelFeedback}</p>
                )}
              </div>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Chicas disponibles
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {availableCharacters.length}{" "}
              <span className="text-base font-medium text-slate-400">/ {characters.length}</span>
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Imágenes restantes
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {subscription ? subscription.imageCredits : "—"}
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Mensajes enviados
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {subscription ? subscription.messagesUsed : "—"}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Personajes disponibles</h2>
            <div className="mt-4 space-y-3">
              {availableCharacters.map((c) => (
                <Link
                  key={c.id}
                  href={`/chat?personaje=${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-cyan-400/30"
                >
                  <Avatar name={c.name} image={c.image} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.personality}</p>
                  </div>
                </Link>
              ))}
              {user.plan === "FREE" && (
                <Link
                  href="/planes"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-400/30 p-3 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/5"
                >
                  + {characters.length - availableCharacters.length} personajes más con Premium
                </Link>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Chats recientes</h2>
            <div className="mt-4 space-y-3">
              {conversations.length === 0 && (
                <p className="text-sm text-slate-400">Aún no tienes conversaciones.</p>
              )}
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat?personaje=${conv.characterSlug}`}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-cyan-400/30"
                >
                  <Avatar name={conv.characterName} image={conv.characterImageUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {conv.characterName}
                      </p>
                      <span className="shrink-0 text-xs text-slate-500">
                        {new Date(conv.updatedAt).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {creditHistory.length > 0 && (
          <div className="mt-10 glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Historial de créditos</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
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
                  {creditHistory.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2 pr-4 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 pr-4">
                        <CreditTypeBadge type={tx.type} />
                      </td>
                      <td className={`py-2 pr-4 text-right font-mono font-semibold ${
                        tx.type === "SPEND" || tx.type === "EXPIRE"
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`}>
                        {tx.type === "SPEND" || tx.type === "EXPIRE" ? "-" : "+"}{tx.amount}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-slate-300">
                        {tx.balanceAfter}
                      </td>
                      <td className="py-2 text-slate-400 max-w-[160px] truncate" title={tx.reason}>
                        {friendlyReason(tx.reason)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {user.role === "ADMIN" && (
          <div className="mt-10 glass rounded-2xl p-6 border border-amber-400/20">
            <h2 className="text-lg font-semibold text-amber-300">Herramientas admin</h2>
            <p className="mt-1 text-xs text-slate-400">
              Simula cambios de plan. Solo visible para administradores.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {devPlans.map(({ plan, label }) => (
                <button
                  key={plan}
                  onClick={() => handleSimulatePlan(plan)}
                  disabled={pendingPlan !== null}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    user.plan === plan
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
        )}
      </div>
    </section>
  );
}
