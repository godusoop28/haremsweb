"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import PremiumBadge from "@/components/PremiumBadge";
import { characters } from "@/lib/data";

interface Message {
  from: "user" | "ai";
  text: string;
}

const repliesByPersonality: Record<string, string[]> = {
  "luna-valmont": [
    "Aww, qué lindo que me digas eso, me sacaste una sonrisa.",
    "Cuéntame más, me encanta escucharte con calma.",
    "Eso me hace sentir muy especial, sigue así.",
    "Justo estaba pensando en ti, qué casualidad.",
  ],
  "hana-mori": [
    "Jajaja eres muy gracioso, no me lo esperaba.",
    "Eyyy, eso suena divertido, cuéntame más!",
    "Vale vale, tienes mi atención, sigue.",
    "Jeje me encanta tu energía hoy.",
  ],
  "aurora-sterling": [
    "Interesante... pocas personas logran sorprenderme así.",
    "Continúa, tienes mi atención por ahora.",
    "Hmm, eso dice bastante de ti.",
    "No está mal. Veamos qué más tienes.",
  ],
  "valeria-cruz": [
    "Me gusta tu confianza, sigue hablando así.",
    "Jaja me caes bien, tienes buena energía.",
    "Eso suena interesante, cuéntame con calma.",
    "Mmm, me gusta cómo piensas.",
  ],
  "camila-rios": [
    "Espera, deja anoto eso... interesante.",
    "Mmm, tiene lógica lo que dices.",
    "No esperaba esa respuesta, sigue.",
    "Bien, tienes mi atención por un momento.",
  ],
  "kiara-blake": [
    "Jaja no está mal para un novato.",
    "GG, esa respuesta tuvo nivel.",
    "Veamos si puedes seguirme el ritmo.",
    "Ok eso me dio un poco de risa, sigue.",
  ],
  "isabella-laurent": [
    "Comprendo. Es una perspectiva interesante.",
    "Continúa, escucho con atención.",
    "Eso requiere cierta madurez para decirlo.",
    "Hablas con calma, eso me agrada.",
  ],
  "nara-voss": [
    "...",
    "Eso no lo esperaba.",
    "Sigue. Te escucho.",
    "Hay algo en lo que dices que me interesa.",
  ],
  "sasha-monroe": [
    "Jajaja me encanta tu actitud!",
    "Eso suena a un buen plan, cuéntame más.",
    "Holaaa, qué buena energía tienes hoy.",
    "Me gusta, sigamos hablando de eso.",
  ],
  "mei-tanaka": [
    "Ah... gracias por contarme eso.",
    "Me alegra que confíes en mí.",
    "Eso es muy lindo de tu parte.",
    "Está bien, tómate tu tiempo, te escucho.",
  ],
  "renata-soler": [
    "Me gusta cómo piensas, sin filtros.",
    "Interesante punto de vista, sigue.",
    "Eso suena auténtico, me agrada.",
    "Cuéntame más, tienes mi atención.",
  ],
  "victoria-hale": [
    "No esperaba que dijeras eso esta noche...",
    "Hay algo en tus palabras que me hace dudar.",
    "Continúa... aunque no sé si debería escuchar esto.",
    "Eso despierta algo en mí que prefería evitar.",
  ],
};

const defaultReplies = [
  "Estoy aquí contigo...",
  "Cuéntame más, te escucho con atención.",
  "Eso me hace sonreír, sigue contándome.",
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
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const character = characters.find((c) => c.id === selectedId)!;
  const messages = messagesByChar[selectedId] ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isTyping]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessagesByChar((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), { from: "user", text: trimmed }],
    }));
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const pool = repliesByPersonality[selectedId] ?? defaultReplies;
      const reply = pool[Math.floor(Math.random() * pool.length)];
      setIsTyping(false);
      setMessagesByChar((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), { from: "ai", text: reply }],
      }));
    }, 1200);
  }

  return (
    <div className="chat-bg flex h-[calc(100vh-65px)] flex-col lg:mx-auto lg:max-w-7xl lg:flex-row">
      {/* Mobile / tablet character selector */}
      <div className="scroll-neon flex shrink-0 gap-3 overflow-x-auto border-b border-white/5 bg-black/20 px-4 py-3 backdrop-blur-xl lg:hidden">
        {characters.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedId(c.id);
              setImageNotice(false);
            }}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <Avatar
              name={c.name}
              image={c.image}
              size="md"
              className={`transition-all ${
                selectedId === c.id
                  ? "ring-2 ring-cyan-400 shadow-[0_0_18px_-4px_rgba(34,211,238,0.8)]"
                  : "opacity-60 ring-white/10"
              }`}
            />
            <span
              className={`max-w-[64px] truncate text-[11px] font-medium ${
                selectedId === c.id ? "text-cyan-300" : "text-slate-400"
              }`}
            >
              {c.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop sidebar */}
      <aside className="scroll-neon hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-black/20 backdrop-blur-xl lg:flex">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            Personajes
          </h2>
        </div>
        <div className="flex-1 space-y-1 p-2">
          {characters.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                setImageNotice(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                selectedId === c.id
                  ? "glass-strong border border-cyan-400/30 shadow-[0_0_25px_-12px_rgba(34,211,238,0.6)]"
                  : "border border-transparent hover:border-white/10 hover:bg-white/5"
              }`}
            >
              <Avatar name={c.name} image={c.image} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-white">{c.name}</span>
                  {c.isPremium && (
                    <span className="shrink-0 rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      PRO
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
        {/* Header */}
        <div className="glass-strong flex items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-6">
          <Avatar name={character.name} image={character.image} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-white sm:text-lg">
              {character.name}
            </h2>
            <p className="truncate text-xs text-cyan-300/80 sm:text-sm">{character.archetype}</p>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
              En línea
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <PremiumBadge access={character.access} isPremium={character.isPremium} />
            <span className="text-[11px] text-slate-500">Dificultad: {character.difficulty}</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="scroll-neon flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6"
        >
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.from === "ai" && (
                <Avatar name={character.name} image={character.image} size="sm" className="mr-2 mt-auto hidden sm:block" />
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg sm:max-w-[60%] ${
                  message.from === "user"
                    ? "glow-button bg-gradient-to-br from-cyan-400 to-blue-600 text-white"
                    : "border border-white/5 bg-slate-900/70 text-slate-200 backdrop-blur-md"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <Avatar name={character.name} image={character.image} size="sm" className="mr-2 mt-auto hidden sm:block" />
              <div className="flex items-center gap-1 rounded-2xl border border-white/5 bg-slate-900/70 px-4 py-3 backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-400" />
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-400 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-400 [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {imageNotice && (
          <div className="mx-4 mb-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-300 sm:mx-6">
            La generación de imágenes es solo una vista previa visual. Esta función se
            conectará próximamente a un servicio real.
          </div>
        )}

        {/* Input bar */}
        <div className="glass-strong border-t border-white/5 px-4 py-4 sm:px-6">
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
              {!character.isPremium ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5h.008v.008H3v-.008Zm0 0V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v10.5Z" />
                </svg>
              )}
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
              className="flex-1 rounded-full border border-cyan-400/15 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 backdrop-blur-md focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
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
