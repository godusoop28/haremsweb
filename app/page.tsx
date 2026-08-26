"use client";

import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import FeaturedCharacters from "@/components/FeaturedCharacters";
import PricingSection from "@/components/PricingSection";
import AuthenticatedHome from "@/components/AuthenticatedHome";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, token, loading } = useAuth();

  // Mientras se resuelve la sesión no mostramos ninguna de las dos variantes — evita el
  // parpadeo landing-pública → home-personalizada (mismo criterio que la navbar).
  if (loading) {
    return <div className="min-h-[60vh]" aria-hidden="true" />;
  }

  if (user && token) {
    return <AuthenticatedHome user={user} token={token} />;
  }

  return (
    <>
      <Hero />
      <Benefits />
      <FeaturedCharacters />
      <PricingSection />
    </>
  );
}
