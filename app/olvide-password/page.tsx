import type { Metadata } from "next";
import OlvidePasswordClient from "./OlvidePasswordClient";

export const metadata: Metadata = {
  title: "Recuperar contraseña — HAREMS",
};

export default function OlvidePasswordPage() {
  return <OlvidePasswordClient />;
}
