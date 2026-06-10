import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Iniciar sesión — HAREMS",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para continuar tus conversaciones."
      submitLabel="Iniciar sesión"
      switchHref="/registro"
      switchPrompt="¿No tienes una cuenta?"
      switchLabel="Crear cuenta"
    />
  );
}
