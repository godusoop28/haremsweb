import type { Metadata } from "next";
import CreditosClient from "./CreditosClient";

export const metadata: Metadata = {
  title: "Créditos extra — HAREMS",
};

export default function CreditosPage() {
  return <CreditosClient />;
}
