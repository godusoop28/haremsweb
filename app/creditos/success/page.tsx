import type { Metadata } from "next";
import CreditosSuccessClient from "./CreditosSuccessClient";

export const metadata: Metadata = {
  title: "Pago confirmado — HAREMS",
};

export default function CreditosSuccessPage() {
  return <CreditosSuccessClient />;
}
