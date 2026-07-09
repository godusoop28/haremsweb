"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import ConnectionMeter from "@/components/ConnectionMeter";
import PremiumBadge from "@/components/PremiumBadge";
import UpgradeModal from "@/components/UpgradeModal";
import { characters } from "@/lib/data";
import { api, ApiError, type CharacterResponse, type PlanType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Message {
  from: "user" | "ai" | "system";
  text: string;
  imageUrl?: string;
}

interface UpgradeModalState {
  title: string;
  message: string;
  benefits?: string[];
  ctaLabel?: string;
}

const planRank: Record<PlanType, number> = {
  FREE: 0,
  TRIAL_3_DAYS: 1,
  PREMIUM: 1,
  VIP: 2,
};

const accessRank: Record<CharacterResponse["accessType"], number> = {
  FREE: 0,
  PREMIUM: 1,
  VIP: 2,
};

function canAccess(plan: PlanType | undefined, accessType: CharacterResponse["accessType"]) {
  if (!plan) return accessType === "FREE";
  return planRank[plan] >= accessRank[accessType];
}

export default function ChatClient({ initialId }: { initialId: string }) {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const initialCharacter = characters.find((c) => c.id === initialId) ?? characters[0];
  const [selectedId, setSelectedId] = useState(initialCharacter.id);
  const [messagesByChar, setMessagesByChar] = useState<Record<string, Message[]>>({});
  const [conversationIds, setConversationIds] = useState<Record<string, number>>({});
  const [loadedChars, setLoadedChars] = useState<Record<string, boolean>>({});
  const [remoteCharacters, setRemoteCharacters] = useState<CharacterResponse[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageCredits, setImageCredits] = useState<number | null>(null);
  const [imageLevel, setImageLevel] = useState<"SAFE" | "SENSUAL" | "NUDE" | "EXPLICIT">("NUDE");
  const [usage, setUsage] = useState<Record<string, { used: number; limit: number | null }>>({});
  // Gate: true cuando getConversations() ha terminado (con éxito o error).
  // Evita que el historial se cargue antes de tener los IDs reales.
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<UpgradeModalState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const character = characters.find((c) => c.id === selectedId)!;
  const remote = remoteCharacters.find((c) => c.slug === selectedId);
  const messages = messagesByChar[selectedId] ?? [];

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !token) {
      router.replace(`/login?next=/chat?personaje=${initialId}`);
    }
  }, [authLoading, token, router, initialId]);

  // ── Load characters + subscription (image credits) ───────────────────────────
  useEffect(() => {
    if (!token) return;

    api.getCharacters().then(setRemoteCharacters).catch(() => {});

    // Fetch current image credit balance once on load
    api
      .getSubscription(token)
      .then((sub) => setImageCredits(sub.imageCredits))
      .catch(() => {});

    api
      .getConversations(token)
      .then((conversations) => {
        const ids: Record<string, number> = {};
        conversations.forEach((c) => {
          ids[c.characterSlug] = c.id;
        });
        setConversationIds(ids);
      })
      .catch(() => {})
      .finally(() => {
        // Marcar como cargado siempre (éxito o error) para que el historial pueda cargar
        setConversationsLoaded(true);
      });
  }, [token]);

  // ── Load conversation history per character ───────────────────────────────────
  // IMPORTANTE: esperamos a que conversationsLoaded=true antes de cargar el historial.
  // Sin ese gate, el efecto corría con conversationIds={} (vacío) y marcaba el personaje
  // como "ya cargado" antes de tener los IDs reales → historial nunca se cargaba → mensajes "desaparecían".
  useEffect(() => {
    if (!token || !conversationsLoaded || loadedChars[selectedId]) return;

    const conversationId = conversationIds[selectedId];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadedChars((prev) => ({ ...prev, [selectedId]: true }));

    if (conversationId === undefined) {
      // Personaje sin conversación previa → mostrar saludo
      setMessagesByChar((prev) => ({
        ...prev,
        [selectedId]: [{ from: "ai", text: character.greeting }],
      }));
      return;
    }

    api
      .getConversation(token, conversationId)
      .then((conversation) => {
        const loaded: Message[] = conversation.messages.map((m) => ({
          from: m.sender === "USER" ? "user" : "ai",
          text: m.content,
        }));
        setMessagesByChar((prev) => ({
          ...prev,
          [selectedId]: loaded.length ? loaded : [{ from: "ai", text: character.greeting }],
        }));
      })
      .catch(() => {
        setMessagesByChar((prev) => ({
          ...prev,
          [selectedId]: [{ from: "ai", text: character.greeting }],
        }));
      });
  }, [token, selectedId, conversationIds, conversationsLoaded, loadedChars, character.greeting]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isTyping]);

  function appendMessage(charId: string, message: Message) {
    setMessagesByChar((prev) => ({
      ...prev,
      [charId]: [...(prev[charId] ?? []), message],
    }));
  }

  const charUsage = usage[selectedId];
  const limitReached = charUsage?.limit != null && charUsage.used >= charUsage.limit;

  // ── Image generation capability ──────────────────────────────────────────────
  const isPaidUser = user?.plan !== "FREE";
  const characterSupportsImages = remote?.imageGenerationEnabled ?? false;
  const hasCredits = imageCredits === null || imageCredits > 0; // null = not yet loaded → optimistic
  const imageEnabled = isPaidUser && characterSupportsImages;

  // ── Send chat message ────────────────────────────────────────────────────────
  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || !token || isTyping || limitReached) return;

    appendMessage(selectedId, { from: "user", text: trimmed });
    setInput("");
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(token, {
        characterSlug: selectedId,
        message: trimmed,
      });
      appendMessage(selectedId, { from: "ai", text: response.reply });
      setConversationIds((prev) => ({ ...prev, [selectedId]: response.conversationId }));
      setUsage((prev) => ({
        ...prev,
        [selectedId]: { used: response.messagesUsed, limit: response.messagesLimit },
      }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace(`/login?next=/chat?personaje=${selectedId}`);
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setUpgradeModal({
          title: "Límite gratuito alcanzado",
          message: err.message,
          benefits: [
            "Chat ilimitado con todas las chicas",
            "12 personajes desbloqueadas",
            "Generación de imágenes incluida",
            "Cancela cuando quieras",
          ],
          ctaLabel: "Continuar con Premium",
        });
        return;
      }
      const message =
        err instanceof ApiError ? err.message : "Ocurrió un error inesperado. Inténtalo más tarde.";
      appendMessage(selectedId, { from: "system", text: message });
    } finally {
      setIsTyping(false);
    }
  }

  // ── Generate image ───────────────────────────────────────────────────────────
  async function generateImage() {
    if (!token || generatingImage) return;

    if (!isPaidUser) {
      setUpgradeModal({
        title: "Imágenes disponibles en Premium",
        message: "Genera fotos de tus personajes favoritas con créditos mensuales.",
        benefits: [
          "30 créditos de imagen al mes",
          "Niveles Normal, Sensual y Sin ropa",
          "Historial de imágenes guardado",
          "Nivel Explícita disponible en VIP",
        ],
        ctaLabel: "Desbloquear Premium",
      });
      return;
    }

    if (!characterSupportsImages) {
      appendMessage(selectedId, {
        from: "system",
        text: "Este personaje no tiene generación de imágenes habilitada.",
      });
      return;
    }

    if (imageCredits !== null && imageCredits <= 0) {
      setUpgradeModal({
        title: "Sin créditos de imagen",
        message: "Agotaste tus créditos del mes. Mejora a VIP para obtener más o espera la renovación.",
        benefits: [
          "VIP incluye 100 créditos al mes",
          "Nivel Explícita desbloqueado en VIP",
          "Los créditos se renuevan cada mes",
        ],
        ctaLabel: "Ver planes",
      });
      return;
    }

    setGeneratingImage(true);

    try {
      const response = await api.generateImage(token, {
        characterSlug: selectedId,
        aspectRatio: "portrait",
        style: "premium-realistic-anime",
        adultLevel: imageLevel,
      });
      setImageCredits(response.creditsRemaining);
      const costNote = !response.highTrust && response.creditsCost > 1
        ? ` (costó ${response.creditsCost} créditos — todavía no me conoces bien)`
        : "";
      appendMessage(selectedId, {
        from: "ai",
        text: `Aquí tienes${costNote}. Créditos restantes: ${response.creditsRemaining}.`,
        imageUrl: response.imageUrl,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace(`/login?next=/chat?personaje=${selectedId}`);
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setUpgradeModal({
          title: "Sin créditos disponibles",
          message: err.message,
          ctaLabel: "Ver planes",
        });
        return;
      }
      if (err instanceof ApiError && err.status === 422) {
        if (err.code === "IMAGE_PROVIDER_BLOCKED") {
          // El proveedor no pudo generar — créditos reembolsados por backend
          appendMessage(selectedId, {
            from: "system",
            text: "Estamos preparando la imagen, inténtalo de nuevo en unos segundos.",
          });
          // Refrescar créditos porque el backend los reembolsó
          if (token) {
            api.getSubscription(token).then((sub) => setImageCredits(sub.imageCredits)).catch(() => {});
          }
        } else {
          appendMessage(selectedId, { from: "system", text: err.message });
        }
        return;
      }
      if (err instanceof ApiError && err.status === 400) {
        appendMessage(selectedId, {
          from: "system",
          text: "No se puede generar ese tipo de imagen.",
        });
        return;
      }
      appendMessage(selectedId, {
        from: "system",
        text: "No pudimos generar la imagen. Inténtalo de nuevo.",
      });
    } finally {
      setGeneratingImage(false);
    }
  }

  function selectCharacter(c: CharacterResponse | undefined, id: string) {
    if (c && !canAccess(user?.plan, c.accessType)) {
      const characterName = characters.find((ch) => ch.id === id)?.name ?? "Este personaje";
      if (c.accessType === "VIP") {
        setUpgradeModal({
          title: `${characterName} es exclusiva VIP`,
          message: "Desbloquea el plan VIP para acceder al personaje más difícil e intenso del catálogo.",
          benefits: [
            `Chat privado con ${characterName}`,
            "Generación de imágenes nivel Explícita",
            "100 créditos de imagen al mes",
            "Acceso a todos los personajes Premium",
          ],
          ctaLabel: "Desbloquear VIP",
        });
      } else {
        setUpgradeModal({
          title: `${characterName} es Premium`,
          message: "Desbloquea Premium para chatear con ella y generar imágenes exclusivas.",
          benefits: [
            `Chat ilimitado con ${characterName}`,
            "12 personajes desbloqueados",
            "30 créditos de imagen al mes",
            "Imágenes Normal, Sensual y Sin ropa",
          ],
          ctaLabel: "Desbloquear Premium",
        });
      }
      return;
    }
    setSelectedId(id);
  }

  if (authLoading || !token) {
    return (
      <div className="flex h-[calc(100dvh-65px)] items-center justify-center">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    );
  }

  // Button tooltip text
  function imageButtonTitle() {
    if (!isPaidUser) return "Disponible en Premium";
    if (!characterSupportsImages) return "No disponible para este personaje";
    if (imageCredits !== null && imageCredits <= 0) return "Sin créditos de imagen";
    if (generatingImage) return "Generando imagen…";
    return "Generar imagen";
  }

  const imageButtonDisabled = !imageEnabled || generatingImage || (imageCredits !== null && imageCredits <= 0);

  return (
    <div className="chat-bg flex h-[calc(100dvh-65px)] flex-col overflow-hidden lg:mx-auto lg:max-w-7xl lg:flex-row">
      {/* Mobile / tablet character selector */}
      <div className="scroll-neon flex shrink-0 gap-2.5 overflow-x-auto border-b border-white/5 bg-black/20 px-3 py-2.5 backdrop-blur-xl lg:hidden">
        {characters.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCharacter(remoteCharacters.find((r) => r.slug === c.id), c.id)}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <Avatar
              name={c.name}
              image={c.image}
              size="sm"
              className={`transition-all ${
                selectedId === c.id
                  ? "ring-2 ring-cyan-400 shadow-[0_0_18px_-4px_rgba(34,211,238,0.8)]"
                  : "opacity-60 ring-white/10"
              }`}
            />
            <span
              className={`max-w-[56px] truncate text-[10px] font-medium ${
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
          {characters.map((c) => {
            const remoteC = remoteCharacters.find((r) => r.slug === c.id);
            const locked = remoteC ? !canAccess(user?.plan, remoteC.accessType) : c.isPremium;
            return (
              <button
                key={c.id}
                onClick={() => selectCharacter(remoteC, c.id)}
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
                    <PremiumBadge
                      access={c.isPremium ? "Premium" : "Gratis"}
                      isPremium={locked}
                      className="shrink-0 px-2 py-0.5 text-[10px]"
                    />
                  </div>
                  <p className="truncate text-xs text-slate-400">{c.archetype}</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="glass-strong shrink-0 border-b border-white/5 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Avatar name={character.name} image={character.image} size="md" className="sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-white sm:text-lg">
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
              <span className="hidden text-[11px] text-slate-500 sm:inline">
                Dificultad: {character.difficulty}
              </span>
              {imageEnabled && imageCredits !== null && (
                <span
                  className={`text-[11px] font-medium ${
                    imageCredits <= 0 ? "text-amber-400" : "text-cyan-400"
                  }`}
                >
                  {imageCredits > 0
                    ? `${imageCredits} crédito${imageCredits !== 1 ? "s" : ""} foto`
                    : "Sin créditos foto"}
                </span>
              )}
            </div>
          </div>
          <ConnectionMeter
            trustLevel={character.trustLevel}
            relationshipStatus={character.relationshipStatus}
            variant="compact"
            className="mt-3 hidden sm:flex"
          />
          {user?.plan === "FREE" && charUsage?.limit != null && (
            <div className="mt-2 flex items-center justify-between gap-3 text-xs sm:mt-3">
              <span className={limitReached ? "text-amber-300" : "text-slate-400"}>
                Mensajes gratis: {charUsage.used} / {charUsage.limit}
              </span>
              {limitReached && (
                <Link
                  href="/planes"
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/20"
                >
                  Mejorar plan
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="scroll-neon min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6"
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
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg sm:max-w-[60%] ${
                  message.from === "user"
                    ? "glow-button bg-gradient-to-br from-cyan-400 to-blue-600 text-white"
                    : message.from === "system"
                      ? "border border-amber-400/20 bg-amber-400/5 text-amber-200"
                      : "border border-white/5 bg-slate-900/70 text-slate-200 backdrop-blur-md"
                }`}
              >
                {message.text}
                {message.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.imageUrl}
                    alt="Imagen generada"
                    className="mt-2 w-full max-w-xs rounded-xl"
                  />
                )}
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

        {/* Input bar */}
        <div className="glass-strong shrink-0 border-t border-white/5 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
          {/* Level selector — only visible when image generation is available */}
          {imageEnabled && (
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Foto:</span>
              {(["SAFE", "SENSUAL", "NUDE", "EXPLICIT"] as const).map((lvl) => {
                const labels: Record<string, string> = {
                  SAFE: "Normal",
                  SENSUAL: "Sensual",
                  NUDE: "Sin ropa",
                  EXPLICIT: "Explícita",
                };
                // EXPLICIT solo visible para VIP
                if (lvl === "EXPLICIT" && user?.plan !== "VIP") return null;
                return (
                  <button
                    key={lvl}
                    onClick={() => setImageLevel(lvl)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                      imageLevel === lvl
                        ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40"
                        : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
                    }`}
                  >
                    {labels[lvl]}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Image generation button */}
            <button
              disabled={imageButtonDisabled}
              onClick={generateImage}
              title={imageButtonTitle()}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2.5 text-xs font-medium transition-colors sm:px-4 ${
                imageButtonDisabled
                  ? "cursor-not-allowed border-white/5 bg-white/5 text-slate-500"
                  : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
              }`}
            >
              {generatingImage ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : !imageEnabled ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5h.008v.008H3v-.008Zm0 0V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v10.5Z" />
                </svg>
              )}
              <span className="hidden sm:inline">
                {generatingImage
                  ? "Generando…"
                  : !isPaidUser
                    ? "Solo Premium"
                    : imageCredits !== null && imageCredits <= 0
                      ? "Sin créditos"
                      : "Generar foto"}
              </span>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              type="text"
              disabled={limitReached}
              placeholder={
                limitReached ? "Límite de mensajes gratuitos alcanzado" : "Escribe un mensaje…"
              }
              className="flex-1 rounded-full border border-cyan-400/15 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 backdrop-blur-md focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              onClick={sendMessage}
              disabled={limitReached}
              className="glow-button flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 p-2.5 text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensaje"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {upgradeModal && (
        <UpgradeModal
          title={upgradeModal.title}
          message={upgradeModal.message}
          benefits={upgradeModal.benefits}
          ctaLabel={upgradeModal.ctaLabel}
          onClose={() => setUpgradeModal(null)}
        />
      )}
    </div>
  );
}
