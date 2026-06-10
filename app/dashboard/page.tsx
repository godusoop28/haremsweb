import type { Metadata } from "next";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { characters, mockUser } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mi cuenta — HAREMS",
};

export default function DashboardPage() {
  const availableCharacters = characters.filter((c) => c.isFree);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Hola, <span className="text-gradient">{mockUser.name.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">{mockUser.email}</p>
          </div>
          <Link
            href="/planes"
            className="glow-button rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Mejorar plan
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Plan actual
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{mockUser.plan}</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Chicas disponibles
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {mockUser.plan === "Gratis" ? "2" : "12"}{" "}
              <span className="text-base font-medium text-slate-400">/ 12</span>
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Imágenes restantes
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{mockUser.imagesRemaining}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Personajes disponibles</h2>
            <div className="mt-4 space-y-3">
              {availableCharacters.map((c) => (
                <Link
                  key={c.id}
                  href={`/chat?personaje=${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-cyan-400/30"
                >
                  <Avatar name={c.name} gradient={c.gradient} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.personality}</p>
                  </div>
                </Link>
              ))}
              {mockUser.plan === "Gratis" && (
                <Link
                  href="/planes"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-400/30 p-3 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/5"
                >
                  + 10 personajes más con Premium
                </Link>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Chats recientes</h2>
            <div className="mt-4 space-y-3">
              {mockUser.chatHistory.map((entry) => {
                const c = characters.find((char) => char.id === entry.characterId)!;
                return (
                  <Link
                    key={entry.characterId}
                    href={`/chat?personaje=${c.id}`}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-cyan-400/30"
                  >
                    <Avatar name={c.name} gradient={c.gradient} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-white">{c.name}</p>
                        <span className="shrink-0 text-xs text-slate-500">{entry.date}</span>
                      </div>
                      <p className="truncate text-xs text-slate-400">{entry.lastMessage}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
