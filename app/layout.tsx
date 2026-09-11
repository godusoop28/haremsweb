import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SEO_TITLE = "HAREMS — Chicas IA y chat con inteligencia artificial";
const SEO_DESCRIPTION =
  "Conoce chicas IA y personajes de inteligencia artificial en HAREMS. Chatea con personalidades únicas, crea conexiones y genera imágenes personalizadas.";

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: [
    "chicas IA",
    "chicas de inteligencia artificial",
    "chat con IA",
    "personajes IA",
    "HAREMS",
  ],
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    siteName: "HAREMS",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "/brand/harems/web/logo-card-800x800.png",
        width: 800,
        height: 800,
        alt: "HAREMS — Chicas IA y chat con inteligencia artificial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: ["/brand/harems/web/logo-card-800x800.png"],
  },
  icons: {
    icon: [
      { url: "/2-removebg-preview.png", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/2-removebg-preview.png", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/brand/harems/favicon/favicon-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/brand/harems/favicon/favicon-512x512.png", sizes: "512x512" },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#05070d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#05070d] text-slate-100">
        <AuthProvider>
          <AgeGate />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
