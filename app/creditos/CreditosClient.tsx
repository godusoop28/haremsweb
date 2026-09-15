"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError, type CreditBalanceResponse, type PricedCreditPackage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { extraCreditPackages } from "@/lib/data";

// Mientras carga el precio real desde backend, se muestra el precio de lista sin descuento (nunca
// se asume VIP en el cliente) — evita pantalla en blanco, mismo patrón que PricingSection.tsx.
const fallbackPackages: PricedCreditPackage[] = extraCreditPackages.map((pkg) => ({
  id: pkg.id,
  credits: pkg.credits,
  basePriceMxn: pkg.priceMxn,
  finalPriceMxn: pkg.priceMxn,
  vipDiscountApplied: false,
}));

export default function CreditosClient() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<CreditBalanceResponse | null>(null);
  const [packages, setPackages] = useState<PricedCreditPackage[]>(fallbackPackages);
  const [pendingPackageId, setPendingPackageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login?next=/creditos");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    api.getCreditBalance(token).then(setBalance).catch(() => {});
    // Precio real (con descuento VIP si aplica) calculado por backend — nunca en el cliente.
    api.getExtraCreditPackages(token).then(setPackages).catch(() => {});
  }, [token]);

  async function handleBuy(packageId: string) {
    if (!token || pendingPackageId) return;
    setPendingPackageId(packageId);
    setError(null);
    try {
      const order = await api.createCreditOrder(token, packageId);
      window.location.href = order.approvalUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos iniciar el pago. Intenta de nuevo.");
      setPendingPackageId(null);
    }
  }

  if (authLoading || !token || !user) {
    return (
      <div className="flex min-h-[calc(100dvh-65px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300">
            Pago único · PayPal
          </span>
          <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Créditos <span className="text-gradient">extra</span>
          </h1>
          <p className="mt-3 text-slate-400">
            Compra imágenes adicionales sin cambiar de plan. 1 crédito = 1 imagen adicional. Los
            créditos extra no se reinician semanalmente.
          </p>
          {balance && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 text-sm font-medium text-cyan-300">
              Saldo actual: {balance.imageCredits} créditos
            </p>
          )}
        </div>

        {error && (
          <p className="mx-auto mt-6 max-w-md rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
          {packages.map((pkg) => (
            <div key={pkg.id} className="glass rounded-2xl p-8 text-center">
              <p className="text-4xl font-extrabold text-white">{pkg.credits}</p>
              <p className="mt-1 text-sm text-slate-400">imágenes extra</p>

              {pkg.vipDiscountApplied ? (
                <>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="text-sm text-slate-500 line-through">${pkg.basePriceMxn} MXN</span>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                      Oferta
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-cyan-300">${pkg.finalPriceMxn} MXN</p>
                  <p className="mt-1 text-xs font-medium text-amber-300">10% de descuento VIP</p>
                </>
              ) : (
                <p className="mt-4 text-2xl font-bold text-cyan-300">${pkg.finalPriceMxn} MXN</p>
              )}

              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={pendingPackageId !== null}
                className="glow-button mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingPackageId === pkg.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Redirigiendo…
                  </span>
                ) : (
                  `Comprar ${pkg.credits} imágenes`
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-300">
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
