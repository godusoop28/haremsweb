import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Crear cuenta — HAREMS",
};

export default function RegistroPage() {
  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="Regístrate para acceder a Luna y Hana de forma gratuita."
      submitLabel="Crear cuenta"
      showName
      switchHref="/login"
      switchPrompt="¿Ya tienes una cuenta?"
      switchLabel="Iniciar sesión"
    />
  );
}
