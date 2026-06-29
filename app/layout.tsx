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

export const metadata: Metadata = {
  title: "HAREMS — Chat con chicas IA personalizadas",
  description:
    "Plataforma de chat con personajes de inteligencia artificial. Doce personalidades únicas, conversaciones privadas y planes premium.",
  icons: {
    icon: [
      { url: "/brand/harems/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/harems/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
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
