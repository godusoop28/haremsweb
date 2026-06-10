import type { Metadata } from "next";
import PricingSection from "@/components/PricingSection";

export const metadata: Metadata = {
  title: "Planes — HAREMS",
};

export default function PlanesPage() {
  return (
    <section className="px-4 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-white sm:text-5xl">
          Planes <span className="text-gradient">simples y transparentes</span>
        </h1>
        <p className="mt-4 text-slate-400">
          Sin contratos, sin sorpresas. Mejora o cancela cuando quieras.
        </p>
      </div>
      <PricingSection />
    </section>
  );
}
