import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import { FREE_MESSAGES_PER_CHARACTER } from "@/lib/data";

export const metadata: Metadata = {
  title: "Crear cuenta — HAREMS",
};

export default function RegistroPage() {
  return (
    <AuthCard
      mode="register"
      title="Crea tu cuenta"
      subtitle={`Regístrate gratis y prueba a cada chica con ${FREE_MESSAGES_PER_CHARACTER} mensajes.`}
      submitLabel="Crear cuenta"
      showName
      switchHref="/login"
      switchPrompt="¿Ya tienes una cuenta?"
      switchLabel="Iniciar sesión"
    />
  );
}
