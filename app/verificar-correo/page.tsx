import type { Metadata } from "next";
import VerificarCorreoClient from "./VerificarCorreoClient";

export const metadata: Metadata = {
  title: "Verifica tu correo — HAREMS",
};

export default function VerificarCorreoPage() {
  return <VerificarCorreoClient />;
}
