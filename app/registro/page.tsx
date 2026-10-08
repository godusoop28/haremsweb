import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import { FREE_MESSAGES_PER_CHARACTER, FREE_TRIAL_NAMES_TEXT } from "@/lib/data";

export const metadata: Metadata = {
  title: "Crear cuenta — HAREMS",
};

export default function RegistroPage() {
  return (
    <AuthCard
      mode="register"
      title="Crea tu cuenta"
      subtitle={`Regístrate gratis: ${FREE_MESSAGES_PER_CHARACTER} mensajes con ${FREE_TRIAL_NAMES_TEXT} cada una.`}
      submitLabel="Crear cuenta"
      showName
      switchHref="/login"
      switchPrompt="¿Ya tienes una cuenta?"
      switchLabel="Iniciar sesión"
    />
  );
}
