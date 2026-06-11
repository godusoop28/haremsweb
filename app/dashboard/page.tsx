import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Mi cuenta — HAREMS",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
