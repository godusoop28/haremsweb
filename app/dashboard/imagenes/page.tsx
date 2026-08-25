import type { Metadata } from "next";
import ImagesClient from "./ImagesClient";

export const metadata: Metadata = {
  title: "Mis imágenes — HAREMS",
};

export default function ImagesPage() {
  return <ImagesClient />;
}
