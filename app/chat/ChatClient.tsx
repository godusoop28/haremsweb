"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import GeneratedImage from "@/components/GeneratedImage";
import LiveConnectionMeter from "@/components/LiveConnectionMeter";
import PremiumBadge from "@/components/PremiumBadge";
import UpgradeModal from "@/components/UpgradeModal";
import { characters } from "@/lib/data";
import { canAccessType } from "@/lib/access";
import { useRemoteCharacters } from "@/lib/useCharacters";
import {
  api,
  ApiError,
  relationshipStatusLabels,
  type AdultLevel,
  type CharacterResponse,
  type ImageLimitPeriod,
  type RelationshipResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface ImageUsageState {
  usedThisPeriod: number;
  limitPerPeriod: number;
  period: ImageLimitPeriod;
  extraCredits: number;
}

function imagesRemainingInPeriod(usage: ImageUsageState): number {
  return Math.max(0, usage.limitPerPeriod - usage.usedThisPeriod);
}

function periodWord(period: ImageLimitPeriod): string {
  return period === "DAILY" ? "hoy" : "esta semana";
}

interface Message {
  from: "user" | "ai" | "system" | "levelup";
  text: string;
  imageUrl?: string;
  adultLevel?: AdultLevel;
  createdAt?: string;
}

interface UpgradeModalState {
  title: string;
  message: string;
  benefits?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

const levelLabels: Record<AdultLevel, string> = {
  SAFE: "Normal",
  SENSUAL: "Sensual",
  NUDE: "Sin ropa",
  EXPLICIT: "Explícita",
};

const SCENE_PRESETS: { label: string; value: string }[] = [
  { label: "Habitación", value: "intimate bedroom with warm lighting" },
  { label: "Hotel", value: "luxury hotel suite with soft warm lighting" },
  { label: "Terraza nocturna", value: "rooftop terrace at night with city lights below" },
  { label: "Playa", value: "beach at golden sunset with soft waves" },
  { label: "Piscina", value: "private poolside with crystal water" },
  { label: "Oficina", value: "private elegant office at night" },
  { label: "Gimnasio", value: "modern gym with mirrored walls" },
];

const POSE_PRESETS: { label: string; value: string }[] = [
  { label: "Retrato", value: "close portrait framing, natural relaxed pose" },
  { label: "De pie", value: "standing confident pose" },
  { label: "Sentada", value: "sitting relaxed pose" },
  { label: "Mirando a cámara", value: "looking directly at camera, engaging gaze" },
  { label: "Espontánea", value: "candid natural spontaneous pose" },
];

const ASPECT_OPTIONS: { label: string; value: "portrait" | "square" | "landscape" }[] = [
  { label: "Retrato", value: "portrait" },
  { label: "Cuadrada", value: "square" },
  { label: "Horizontal", value: "landscape" },
];

const AUTO = "Automática";
const CUSTOM = "Personalizada";

export default function ChatClient({ initialId }: { initialId: string }) {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const remoteCharacters = useRemoteCharacters();

  const visibleCharacters = characters.filter((c) => !c.comingSoon);
  const initialCharacter = characters.find((c) => c.id === initialId) ?? characters[0];
  const [selectedId, setSelectedId] = useState(initialCharacter.id);
  const [messagesByChar, setMessagesByChar] = useState<Record<string, Message[]>>({});
  const [conversationIds, setConversationIds] = useState<Record<string, number>>({});
  const [loadedChars, setLoadedChars] = useState<Record<string, boolean>>({});
  const [relationships, setRelationships] = useState<Record<string, RelationshipResponse>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageUsage, setImageUsage] = useState<ImageUsageState | null>(null);
  const [imageLevel, setImageLevel] = useState<AdultLevel>("NUDE");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // ── Panel "Crear imagen" — colapsado por defecto, separado visualmente del chat normal ──────
  const [showImagePanel, setShowImagePanel] = useState(false);

  // ── Personalización de la generación ────────────────────────────────────────
  const [showCustomize] = useState(false);
  const [sceneChoice, setSceneChoice] = useState<string>(AUTO);
  const [customSceneText, setCustomSceneText] = useState("");
  const [poseChoice, setPoseChoice] = useState<string>(AUTO);
  const [customPoseText, setCustomPoseText] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square" | "landscape">("portrait");
  const [customPrompt, setCustomPrompt] = useState("");

  const [usage, setUsage] = useState<Record<string, { used: number; limit: number | null }>>({});
  // Gate: true cuando getConversations() ha terminado (con éxito o error).
  // Evita que el historial se cargue antes de tener los IDs reales.
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<UpgradeModalState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const character = characters.find((c) => c.id === selectedId)!;
  const remote = remoteCharacters.find((c) => c.slug === selectedId);
  const messages = messagesByChar[selectedId] ?? [];
  const relationship = relationships[selectedId];

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !token) {
      router.replace(`/login?next=/chat?personaje=${initialId}`);
    }
  }, [authLoading, token, router, initialId]);

  // ── Mantener selectedId sincronizado con ?personaje= (atrás/adelante del navegador) ────────
  // selectCharacter ya actualiza la URL al hacer clic; esto cubre el otro sentido — si el usuario
  // usa el botón "atrás", el query param cambia solo pero React nunca se enteraba.
  useEffect(() => {
    const param = searchParams.get("personaje");
    if (param && param !== selectedId && visibleCharacters.some((c) => c.id === param)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedId(param);
    }
  }, [searchParams, selectedId]);

  // ── Load subscription + conversations index ───────────────────────────────────
  useEffect(() => {
    if (!token) return;

    api
      .getSubscription(token)
      .then((sub) =>
        setImageUsage({
          usedThisPeriod: sub.imagesUsedThisPeriod,
          limitPerPeriod: sub.imagesLimitPerPeriod,
          period: sub.imageLimitPeriod,
          extraCredits: sub.imageCredits,
        })
      )
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
        setConversationsLoaded(true);
      });
  }, [token]);

  // ── Load conversation history per character ───────────────────────────────────
  useEffect(() => {
    if (!token || !conversationsLoaded || loadedChars[selectedId]) return;

    const conversationId = conversationIds[selectedId];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadedChars((prev) => ({ ...prev, [selectedId]: true }));

    if (conversationId === undefined) {
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
          imageUrl: m.messageType === "IMAGE" && m.imageUrl ? m.imageUrl : undefined,
          createdAt: m.createdAt,
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

  // ── Load real connection progress for the selected character ─────────────────
  useEffect(() => {
    if (!token) return;
    api
      .getRelationship(token, selectedId)
      .then((rel) => setRelationships((prev) => ({ ...prev, [selectedId]: rel })))
      .catch(() => {});
  }, [token, selectedId]);

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

  function refreshRelationship(slug: string) {
    if (!token) return;
    api
      .getRelationship(token, slug)
      .then((rel) => setRelationships((prev) => ({ ...prev, [slug]: rel })))
      .catch(() => {});
  }

  function notifyLevelUp(charId: string, charName: string, status: RelationshipResponse["relationshipStatus"]) {
    appendMessage(charId, {
      from: "levelup",
      text: `Tu conexión con ${charName} subió de nivel · ${relationshipStatusLabels[status]}`,
    });
  }

  const charUsage = usage[selectedId];
  const limitReached = charUsage?.limit != null && charUsage.used >= charUsage.limit;

  // ── Image generation capability ──────────────────────────────────────────────
  const isPaidUser = user?.plan !== "FREE";
  const characterSupportsImages = remote?.imageGenerationEnabled ?? false;
  const hasImageQuota =
    imageUsage === null || imagesRemainingInPeriod(imageUsage) > 0 || imageUsage.extraCredits > 0;
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
      refreshRelationship(selectedId);
      if (response.connectionLeveledUp) {
        notifyLevelUp(selectedId, character.name, response.relationshipStatus);
      }
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
            "16 personajes desbloqueadas",
            "Generación de imágenes incluida",
            "Cancela cuando quieras",
          ],
          ctaLabel: "Continuar con Premium",
        });
        return;
      }
      if (err instanceof ApiError && err.status === 429) {
        appendMessage(selectedId, {
          from: "system",
          text: "Vas muy rápido. Espera un momento antes de enviar otro mensaje.",
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

  // ── Resolver escena/pose elegidas en el panel de personalización ─────────────
  function resolveScene(): string | undefined {
    if (sceneChoice === AUTO) return undefined;
    if (sceneChoice === CUSTOM) return customSceneText.trim() || undefined;
    return SCENE_PRESETS.find((s) => s.label === sceneChoice)?.value;
  }

  function resolvePose(): string | undefined {
    if (poseChoice === AUTO) return undefined;
    if (poseChoice === CUSTOM) return customPoseText.trim() || undefined;
    return POSE_PRESETS.find((p) => p.label === poseChoice)?.value;
  }

  // ── Generate image ───────────────────────────────────────────────────────────
  async function generateImage() {
    if (!token || generatingImage) return;

    if (!isPaidUser) {
      setUpgradeModal({
        title: "Imágenes disponibles en Premium",
        message: "Genera fotos de tus personajes favoritas cada semana.",
        benefits: [
          "15 imágenes por semana",
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

    if (imageUsage !== null && !hasImageQuota) {
      setUpgradeModal({
        title: "Sin imágenes disponibles",
        message: `Ya usaste tus imágenes disponibles de ${periodWord(imageUsage.period)}. Compra créditos extra para seguir generando sin esperar la renovación.`,
        benefits: [
          "1 crédito = 1 imagen adicional",
          "No se reinician semanalmente",
          "6 créditos por $59 MXN o 12 por $99 MXN",
        ],
        ctaLabel: "Comprar créditos extra",
        ctaHref: "/creditos",
      });
      return;
    }

    setGeneratingImage(true);
    const levelUsed = imageLevel;

    try {
      const response = await api.generateImage(token, {
        characterSlug: selectedId,
        aspectRatio,
        style: "premium-realistic-anime",
        adultLevel: levelUsed,
        scene: resolveScene(),
        pose: resolvePose(),
        userPrompt: customPrompt.trim() || undefined,
      });
      const nextUsage: ImageUsageState = {
        usedThisPeriod: response.imagesUsedThisPeriod,
        limitPerPeriod: response.imagesLimitPerPeriod,
        period: response.imageLimitPeriod,
        extraCredits: response.extraCreditsRemaining,
      };
      setImageUsage(nextUsage);
      appendMessage(selectedId, {
        from: "ai",
        text: response.usedExtraCredit ? "Aquí tienes (usó 1 crédito extra)." : "Aquí tienes.",
        imageUrl: response.imageUrl,
        adultLevel: levelUsed,
      });
      refreshRelationship(selectedId);
      if (response.connectionLeveledUp) {
        notifyLevelUp(selectedId, character.name, response.relationshipStatus);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace(`/login?next=/chat?personaje=${selectedId}`);
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        const isVipLevel = err.message.toLowerCase().includes("vip");
        setUpgradeModal({
          title: isVipLevel ? "Nivel disponible en VIP" : "Sin imágenes disponibles",
          message: err.message,
          ctaLabel: isVipLevel ? "Ver planes" : "Comprar créditos extra",
          ctaHref: isVipLevel ? "/planes" : "/creditos",
        });
        return;
      }
      if (err instanceof ApiError && err.status === 429) {
        appendMessage(selectedId, {
          from: "system",
          text: "Estás generando imágenes muy rápido. Espera un momento e inténtalo de nuevo.",
        });
        return;
      }
      if (err instanceof ApiError && (err.status === 422 || err.status === 502)) {
        appendMessage(selectedId, {
          from: "system",
          text:
            err.code === "IMAGE_PROVIDER_BLOCKED"
              ? err.message
              : "No pudimos generar la imagen en este momento. Tu cupo fue restaurado — intenta de nuevo.",
        });
        if (token) {
          api
            .getSubscription(token)
            .then((sub) =>
              setImageUsage({
                usedThisPeriod: sub.imagesUsedThisPeriod,
                limitPerPeriod: sub.imagesLimitPerPeriod,
                period: sub.imageLimitPeriod,
                extraCredits: sub.imageCredits,
              })
            )
            .catch(() => {});
        }
        return;
      }
      if (err instanceof ApiError && err.status === 400) {
        appendMessage(selectedId, {
          from: "system",
          text: err.message || "No se puede generar ese tipo de imagen.",
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
    if (c && !canAccessType(user?.plan, c.accessType)) {
      const characterName = characters.find((ch) => ch.id === id)?.name ?? "Este personaje";
      if (c.accessType === "VIP") {
        setUpgradeModal({
          title: `${characterName} es exclusiva VIP`,
          message: "Desbloquea el plan VIP para acceder al personaje más difícil e intenso del catálogo.",
          benefits: [
            `Chat privado con ${characterName}`,
            "Generación de imágenes nivel Explícita",
            "30 imágenes por semana",
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
            "16 personajes desbloqueados",
            "15 imágenes por semana",
            "Imágenes Normal, Sensual y Sin ropa",
          ],
          ctaLabel: "Desbloquear Premium",
        });
      }
      return;
    }
    setSelectedId(id);
    // Bug real reportado: la URL se quedaba en el personaje anterior aunque el chat ya mostrara
    // otro (selectCharacter solo tocaba el estado local). scroll:false porque es solo para que
    // la URL sea compartible/recargable, no una navegación real de página.
    router.replace(`/chat?personaje=${id}`, { scroll: false });
  }

  if (authLoading || !token) {
    return (
      <div className="flex h-[calc(100dvh-65px)] items-center justify-center">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    );
  }

  function imageButtonTitle() {
    if (!isPaidUser) return "Disponible en Premium";
    if (!characterSupportsImages) return "No disponible para este personaje";
    if (imageUsage !== null && !hasImageQuota) {
      return imageUsage.period === "DAILY" ? "Sin imágenes disponibles hoy" : "Sin imágenes disponibles esta semana";
    }
    if (imageUsage !== null && imagesRemainingInPeriod(imageUsage) === 0 && imageUsage.extraCredits > 0) {
      return "Usarás 1 crédito extra para esta imagen.";
    }
    if (generatingImage) return "Generando imagen…";
    return "Generar imagen";
  }

  const imageButtonDisabled = !imageEnabled || generatingImage || (imageUsage !== null && !hasImageQuota);

  return (
    <div className="chat-bg flex h-[calc(100dvh-65px)] flex-col overflow-hidden lg:mx-auto lg:max-w-7xl lg:flex-row">
      {/* Mobile / tablet character selector */}
      <div className="scroll-neon flex shrink-0 gap-2.5 overflow-x-auto border-b border-white/5 bg-black/20 px-3 py-2.5 backdrop-blur-xl lg:hidden">
        {visibleCharacters.map((c) => (
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
          <h2 className="text-sm font-semibold text-white">Conversaciones</h2>
        </div>
        <div className="flex-1 space-y-1 p-2">
          {visibleCharacters.map((c) => {
            const remoteC = remoteCharacters.find((r) => r.slug === c.id);
            const locked = remoteC ? !canAccessType(user?.plan, remoteC.accessType) : c.isPremium;
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
            <Avatar name={character.name} image={character.image} size="md" className="sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-semibold text-white sm:text-lg">
                  {character.name}
                </h2>
                <PremiumBadge access={character.access} isPremium={character.isPremium} className="shrink-0" />
              </div>
              <p className="truncate text-xs text-cyan-300/80 sm:text-sm">{character.archetype}</p>
            </div>
            {imageEnabled && imageUsage !== null && (
              <div className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
                <span
                  className={`text-[11px] font-medium ${!hasImageQuota ? "text-amber-400" : "text-cyan-400"}`}
                >
                  {hasImageQuota
                    ? `${imagesRemainingInPeriod(imageUsage)} img ${periodWord(imageUsage.period)}`
                    : `Sin imágenes ${periodWord(imageUsage.period)}`}
                  {imageUsage.extraCredits > 0 && ` · +${imageUsage.extraCredits} extra`}
                </span>
                <span className="text-[11px] text-slate-500">Dificultad: {character.difficulty}</span>
              </div>
            )}
          </div>

          <LiveConnectionMeter
            level={relationship?.connectionLevel ?? 1}
            maxLevel={relationship?.maxLevel ?? 5}
            status={relationship?.relationshipStatus ?? "DESCONOCIDA"}
            progressPercent={relationship?.progressPercent ?? 0}
            nextLevelAt={relationship?.nextLevelAt}
            points={relationship?.connectionPoints}
            className="mt-2.5 sm:mt-3"
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
          className="scroll-neon min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6"
        >
          {messages.map((message, idx) => {
            if (message.from === "system" || message.from === "levelup") {
              return (
                <div key={idx} className="flex justify-center">
                  <span
                    className={`rounded-full border px-3 py-1 text-center text-[11px] ${
                      message.from === "levelup"
                        ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-300"
                        : "border-amber-400/20 bg-amber-400/5 text-amber-200"
                    }`}
                  >
                    {message.text}
                  </span>
                </div>
              );
            }

            // Agrupa mensajes consecutivos del mismo emisor: el avatar solo aparece en el
            // primero del bloque, el resto se alinea con un espaciador del mismo ancho en vez
            // de repetir la foto en cada burbuja (punto 30 del rediseño).
            // Nota: un mensaje "system"/"levelup" previo ya tiene from !== message.from acá
            // (message.from está acotado a "user"|"ai" por el return de arriba), así que no
            // hace falta chequearlo aparte.
            const previous = messages[idx - 1];
            const isFirstInGroup = !previous || previous.from !== message.from;

            return (
              <div key={idx} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                {message.from === "ai" &&
                  (isFirstInGroup ? (
                    <Avatar name={character.name} image={character.image} size="sm" className="mr-2 mt-auto hidden sm:block" />
                  ) : (
                    <div className="mr-2 hidden w-10 shrink-0 sm:block" aria-hidden="true" />
                  ))}
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl text-sm leading-relaxed shadow-lg sm:max-w-[65%] ${
                    message.imageUrl ? "overflow-hidden p-1.5" : "px-4 py-2.5"
                  } ${
                    message.from === "user"
                      ? "border border-cyan-400/30 bg-cyan-950/60 text-cyan-50"
                      : message.imageUrl
                        ? "border border-cyan-400/20 bg-slate-900/70 text-slate-200 backdrop-blur-md"
                        : "border border-white/5 bg-slate-900/70 text-slate-200 backdrop-blur-md"
                  }`}
                >
                  {message.imageUrl ? (
                    <>
                      <button
                        onClick={() => setLightboxUrl(message.imageUrl!)}
                        className="block w-full"
                      >
                        <GeneratedImage
                          src={message.imageUrl}
                          alt={`Imagen generada de ${character.name}`}
                          className="w-full max-w-xs rounded-xl transition-opacity hover:opacity-90 sm:max-w-[420px]"
                        />
                      </button>
                      <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-2">
                        {message.adultLevel && (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                            {levelLabels[message.adultLevel]}
                          </span>
                        )}
                        {message.createdAt && (
                          <span className="ml-auto text-[10px] text-slate-500">
                            {new Date(message.createdAt).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            );
          })}

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

        {/* Composer */}
        <div className="glass-strong shrink-0 border-t border-white/5 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
          {/* Área A+B+C: controles de generación de imagen, agrupados visualmente aparte del chat —
              colapsado por defecto (punto 33): "Crear imagen" no compite con el chat normal hasta
              que el usuario lo abre a propósito. */}
          {imageEnabled && !showImagePanel && (
            <button
              onClick={() => setShowImagePanel(true)}
              className="mb-2.5 flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-3.5 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/10"
            >
              ✨ Crear imagen
            </button>
          )}
          {imageEnabled && showImagePanel && (
            <div className="mb-2.5 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-2.5">
              <div className="flex items-center justify-between gap-2 pb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300/80">
                  Crear imagen
                </span>
                <button
                  onClick={() => setShowImagePanel(false)}
                  aria-label="Cerrar panel de crear imagen"
                  className="rounded-full p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(["SAFE", "SENSUAL", "NUDE", "EXPLICIT"] as const).map((lvl) => {
                  if (lvl === "EXPLICIT" && user?.plan !== "VIP") return null;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setImageLevel(lvl)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        imageLevel === lvl
                          ? "border border-cyan-400/40 bg-cyan-400/20 text-cyan-300"
                          : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {levelLabels[lvl]}
                    </button>
                  );
                })}

                <button
                  disabled={imageButtonDisabled}
                  onClick={generateImage}
                  title={imageButtonTitle()}
                  className={`ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    imageButtonDisabled
                      ? "cursor-not-allowed border-white/5 bg-white/5 text-slate-500"
                      : "glow-button border-cyan-400/40 bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                  }`}
                >
                  {generatingImage ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5h.008v.008H3v-.008Zm0 0V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v10.5Z" />
                    </svg>
                  )}
                  <span>{generatingImage ? "Generando…" : "Generar foto"}</span>
                </button>
              </div>

              {showCustomize && (
                <div className="mt-2.5 space-y-2 border-t border-white/5 pt-2.5">
                  <PresetRow
                    label="Escena"
                    options={[AUTO, ...SCENE_PRESETS.map((s) => s.label), CUSTOM]}
                    value={sceneChoice}
                    onChange={setSceneChoice}
                  />
                  {sceneChoice === CUSTOM && (
                    <input
                      value={customSceneText}
                      onChange={(e) => setCustomSceneText(e.target.value)}
                      placeholder="Describe la escena…"
                      maxLength={120}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
                    />
                  )}

                  <PresetRow
                    label="Pose"
                    options={[AUTO, ...POSE_PRESETS.map((p) => p.label), CUSTOM]}
                    value={poseChoice}
                    onChange={setPoseChoice}
                  />
                  {poseChoice === CUSTOM && (
                    <input
                      value={customPoseText}
                      onChange={(e) => setCustomPoseText(e.target.value)}
                      placeholder="Describe la pose…"
                      maxLength={120}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
                    />
                  )}

                  <PresetRow
                    label="Formato"
                    options={ASPECT_OPTIONS.map((a) => a.label)}
                    value={ASPECT_OPTIONS.find((a) => a.value === aspectRatio)?.label ?? "Retrato"}
                    onChange={(label) => {
                      const opt = ASPECT_OPTIONS.find((a) => a.label === label);
                      if (opt) setAspectRatio(opt.value);
                    }}
                  />

                  <input
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Detalle extra (opcional)"
                    maxLength={200}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Área D: chat normal */}
          <div className="flex items-center gap-2 sm:gap-3">
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
          ctaHref={upgradeModal.ctaHref}
          onClose={() => setUpgradeModal(null)}
        />
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <GeneratedImage
            src={lightboxUrl}
            alt="Imagen ampliada"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

function PresetRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-16 shrink-0 text-[10px] text-slate-500">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
            value === opt
              ? "border border-cyan-400/40 bg-cyan-400/20 text-cyan-300"
              : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
