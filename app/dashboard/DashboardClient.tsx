"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import AccountSettings from "@/components/AccountSettings";
import GeneratedImage from "@/components/GeneratedImage";
import { characters } from "@/lib/data";
import { canAccessType } from "@/lib/access";
import { useRemoteCharacters } from "@/lib/useCharacters";
import {
  api,
  ApiError,
  relationshipStatusLabels,
  type ConversationResponse,
  type SubscriptionResponse,
  type PlanType,
  type CreditTransactionResponse,
  type CreditTransactionType,
  type ImageGalleryItemResponse,
  type RelationshipResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const planLabels: Record<PlanType, string> = {
  FREE: "Gratis",
  TRIAL_3_DAYS: "Pase 3 días",
  PREMIUM: "Premium",
  VIP: "VIP",
};

const statusLabels: Record<SubscriptionResponse["status"], string> = {
  FREE: "Gratis",
  PENDING: "Pendiente de confirmación",
  ACTIVE: "Activa",
  CANCEL_PENDING: "Cancelada",
  CANCELLED: "Cancelada",
  SUSPENDED: "Suspendida",
  EXPIRED: "Expirada",
  PAST_DUE: "Pago pendiente",
};

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
  if (reason.startsWith("IMAGE_GENERATION_EXTRA_CREDIT:")) return "Imagen generada (crédito extra)";
  if (reason.startsWith("IMAGE_GENERATION:")) return "Imagen generada";
  if (reason.startsWith("IMAGE_BLOCKED_BY_PROVIDER:")) return "Imagen bloqueada (reembolso)";
  if (reason.startsWith("IMAGE_GENERATION_FAILED:")) return "Error de imagen (reembolso)";
  if (reason.startsWith("ADMIN_ADJUST:")) return "Ajuste admin";
  return reason;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "ahora mismo";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" });
}

function StatCard({
  label,
  value,
  sublabel,
  accent,
  icon,
  children,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  const accentStyles: Record<typeof accent, string> = {
    cyan: "bg-cyan-400/10 text-cyan-300",
    purple: "bg-purple-400/10 text-purple-300",
    emerald: "bg-emerald-400/10 text-emerald-300",
    amber: "bg-amber-400/10 text-amber-300",
  };
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}>
          {icon}
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
      {children}
    </div>
  );
}

export default function DashboardClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const remoteCharacters = useRemoteCharacters();

  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [relationships, setRelationships] = useState<Record<string, RelationshipResponse>>({});
  const [cancelPending, setCancelPending] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditTransactionResponse[]>([]);
  const [recentImages, setRecentImages] = useState<ImageGalleryItemResponse[]>([]);

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
    api
      .getRelationships(token)
      .then((list) => {
        const map: Record<string, RelationshipResponse> = {};
        list.forEach((r) => {
          map[r.characterSlug] = r;
        });
        setRelationships(map);
      })
      .catch(() => {});
    api.getCreditTransactions(token, 0, 10)
      .then((page) => setCreditHistory(page.content))
      .catch(() => {});
    // Solo se piden las últimas — la galería completa (con paginación) vive en /dashboard/imagenes.
    api.getMyImages(token, { size: 6 })
      .then((page) => setRecentImages(page.content.filter((img) => img.status === "COMPLETED")))
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
      setCancelFeedback("Tu suscripción fue cancelada. Mantendrás beneficios hasta el final del periodo pagado.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No se pudo cancelar la suscripción.";
      setCancelFeedback(msg);
    } finally {
      setCancelPending(false);
    }
  }

  if (authLoading || !token || !user) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-slate-400">Cargando...</div>
      </section>
    );
  }

  const launchedCharacters = characters.filter((c) => !c.comingSoon);
  const availableCharacters = launchedCharacters.filter((c) => {
    const remote = remoteCharacters.find((r) => r.slug === c.id);
    if (!remote) return !c.isPremium;
    return canAccessType(user.plan, remote.accessType);
  });

  const recentConversations = conversations.slice(0, 3);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* 1. Saludo + plan */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Hola, <span className="text-gradient">{user.name.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {user.email} · Plan <span className="font-medium text-cyan-300">{planLabels[user.plan]}</span>
              {subscription?.expiresAt && user.plan !== "FREE" && (
                <>
                  {" "}
                  · Activo hasta{" "}
                  {new Date(subscription.expiresAt).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </>
              )}
            </p>
          </div>
          {user.plan !== "VIP" && (
            <Link
              href="/planes"
              className="glow-button rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              {user.plan === "PREMIUM" ? "Subir a VIP" : "Gestionar plan"}
            </Link>
          )}
        </div>

        {/* 2. Continuar conversación */}
        <div className="mt-10 glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Continuar conversación</h2>
          {recentConversations.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Aún no tienes conversaciones.{" "}
              <Link href="/chat" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                Empieza a chatear
              </Link>
              .
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {recentConversations.map((conv) => {
                const rel = relationships[conv.characterSlug];
                return (
                  <Link
                    key={conv.id}
                    href={`/chat?personaje=${conv.characterSlug}`}
                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-cyan-400/30"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={conv.characterName} image={conv.characterImageUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{conv.characterName}</p>
                        <p className="text-xs text-slate-500">{relativeTime(conv.updatedAt)}</p>
                      </div>
                    </div>
                    {rel && (
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-400">
                          Nivel {rel.connectionLevel}/{rel.maxLevel}
                        </span>
                        <span className="font-medium text-cyan-300">
                          {relationshipStatusLabels[rel.relationshipStatus]}
                        </span>
                      </div>
                    )}
                    <span className="mt-1 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-center text-xs font-medium text-cyan-300">
                      Continuar
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Imágenes recientes */}
        {recentImages.length > 0 && (
          <div className="mt-8 glass rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Imágenes recientes</h2>
              <Link
                href="/dashboard/imagenes"
                className="text-xs font-medium text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
              >
                Ver todas →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {recentImages.map((img) => (
                <Link
                  key={img.id}
                  href={`/chat?personaje=${img.characterSlug}`}
                  className="group aspect-[3/4] overflow-hidden rounded-xl border border-white/5 transition-colors hover:border-cyan-400/30"
                >
                  <GeneratedImage
                    src={img.imageUrl}
                    alt={`Imagen de ${img.characterName}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 4. Resumen de uso */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Plan actual"
            value={planLabels[user.plan]}
            accent="cyan"
            icon={
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35" />
              </svg>
            }
          >
            {subscription && (
              <p className="mt-1 text-xs text-slate-400">
                {subscription.cancelAtPeriodEnd
                  ? `Cancelada, activa hasta ${
                      subscription.expiresAt
                        ? new Date(subscription.expiresAt).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "fin de periodo"
                    }`
                  : statusLabels[subscription.status]}
                {!subscription.cancelAtPeriodEnd &&
                  subscription.expiresAt &&
                  ` · vence ${new Date(subscription.expiresAt).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}`}
              </p>
            )}
            {subscription?.canCancel && (
              <div className="mt-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelPending}
                  className="text-xs text-rose-400 underline underline-offset-2 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelPending ? "Cancelando…" : "Cancelar suscripción"}
                </button>
                {cancelFeedback && <p className="mt-1 text-xs text-slate-400">{cancelFeedback}</p>}
              </div>
            )}
          </StatCard>

          <StatCard
            label="Chicas disponibles"
            value={`${availableCharacters.length} / ${launchedCharacters.length}`}
            accent="purple"
            icon={
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            }
          />

          <StatCard
            label={subscription?.imageLimitPeriod === "DAILY" ? "Imágenes disponibles hoy" : "Imágenes disponibles"}
            value={
              subscription
                ? `${Math.max(0, subscription.imagesLimitPerPeriod - subscription.imagesUsedThisPeriod)} / ${subscription.imagesLimitPerPeriod}`
                : "—"
            }
            accent="emerald"
            icon={
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5h.008v.008H3v-.008Zm0 0V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v10.5Z" />
              </svg>
            }
          >
            {subscription && (
              <p className="mt-1 text-xs text-slate-500">
                {subscription.imageLimitPeriod === "DAILY"
                  ? "Renovación diaria"
                  : subscription.imageLimitPeriod === "WEEKLY"
                    ? "Renovación semanal"
                    : "Disponible en Premium o VIP"}
              </p>
            )}
            {subscription && subscription.imageCredits > 0 && (
              <p className="mt-1 text-xs font-medium text-cyan-400">
                +{subscription.imageCredits} créditos extra
              </p>
            )}
          </StatCard>

          <StatCard
            label="Mensajes enviados"
            value={subscription ? String(subscription.messagesUsed) : "—"}
            accent="amber"
            icon={
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            }
          />
        </div>

        {/* Personajes disponibles — secundario */}
        <div className="mt-8 glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Personajes disponibles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                + {launchedCharacters.length - availableCharacters.length} personajes más con Premium
              </Link>
            )}
          </div>
        </div>

        {/* 5. Créditos */}
        {creditHistory.length > 0 && (
          <div className="mt-8 glass rounded-2xl p-6">
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
          <div className="mt-8 glass rounded-2xl border border-amber-400/20 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-amber-300">Panel de administración</h2>
              <Link
                href="/admin"
                className="rounded-full border border-amber-400/30 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/10"
              >
                Ir al panel →
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Métricas, usuarios, créditos e imágenes. Las herramientas de simulación de plan viven ahí, no acá.
            </p>
          </div>
        )}

        {/* 6. Cuenta / suscripción */}
        <div className="mt-8">
          <AccountSettings />
        </div>
      </div>
    </section>
  );
}
