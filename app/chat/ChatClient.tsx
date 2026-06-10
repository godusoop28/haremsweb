"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import { characters } from "@/lib/data";

interface Message {
  from: "user" | "ai";
  text: string;
}

const autoReplies = [
  "Estoy aquí contigo...",
  "Cuéntame más, te escucho con atención.",
  "Eso me hace sonreír, sigue contándome.",
  "Me encanta cuando hablamos así.",
  "Interesante... dime más sobre eso.",
];

export default function ChatClient({ initialId }: { initialId: string }) {
  const initialCharacter = characters.find((c) => c.id === initialId) ?? characters[0];
  const [selectedId, setSelectedId] = useState(initialCharacter.id);
  const [messagesByChar, setMessagesByChar] = useState<Record<string, Message[]>>(() => {
    const initial: Record<string, Message[]> = {};
    characters.forEach((c) => {
      initial[c.id] = [{ from: "ai", text: c.greeting }];
    });
    return initial;
  });
  const [input, setInput] = useState("");
  const [imageNotice, setImageNotice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const character = characters.find((c) => c.id === selectedId)!;
  const messages = messagesByChar[selectedId] ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessagesByChar((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), { from: "user", text: trimmed }],
    }));
    setInput("");

    setTimeout(() => {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessagesByChar((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), { from: "ai", text: reply }],
      }));
    }, 1100);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-65px)] max-w-7xl">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/5 bg-[#03050b]/60 lg:flex">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Personajes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {characters.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                setImageNotice(false);
              }}
              className={`flex w-full items-center gap-3 border-b border-white/5 px-5 py-3 text-left transition-colors hover:bg-white/5 ${
                selectedId === c.id ? "bg-white/5" : ""
              }`}
            >
              <Avatar name={c.name} image={c.image} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-white">{c.name}</span>
                  {c.isPremium && (
                    <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      Premium
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-slate-400">{c.archetype}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-6">
          <Avatar name={character.name} image={character.image} size="md" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-white">{character.name}</h2>
            <p className="truncate text-xs text-slate-400">{character.personality}</p>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
              En línea
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                character.isPremium
                  ? "bg-cyan-400/15 text-cyan-300"
                  : "bg-emerald-400/15 text-emerald-300"
              }`}
            >
              {character.access}
            </span>
            <span className="text-[11px] text-slate-500">Dificultad: {character.difficulty}</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[60%] ${
                  message.from === "user"
                    ? "glow-button bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    : "glass text-slate-200"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {imageNotice && (
          <div className="mx-4 mb-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-300 sm:mx-6">
            La generación de imágenes es solo una vista previa visual. Esta función se
            conectará próximamente a un servicio real.
          </div>
        )}

        <div className="border-t border-white/5 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              disabled={!character.isPremium}
              onClick={() => setImageNotice(true)}
              title={!character.isPremium ? "Disponible en Premium" : "Generar imagen"}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2.5 text-xs font-medium transition-colors sm:px-4 ${
                !character.isPremium
                  ? "cursor-not-allowed border-white/5 bg-white/5 text-slate-500"
                  : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5h.008v.008H3v-.008Zm0 0V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v10.5Z" />
              </svg>
              <span className="hidden sm:inline">
                {!character.isPremium ? "Disponible en Premium" : "Generar imagen"}
              </span>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              type="text"
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
            />

            <button
              onClick={sendMessage}
              className="glow-button flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 p-2.5 text-white transition-transform hover:scale-105"
              aria-label="Enviar mensaje"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
