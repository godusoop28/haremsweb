"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp, StepForward } from "lucide-react";
import Avatar from "@/components/Avatar";
import CopyMessageButton from "@/components/CopyMessageButton";
import RoleplayText from "@/components/RoleplayText";
import { trackEvent } from "@/lib/analytics";

type Props = {
  text: string;
  createdAt?: string;
  characterId: string;
  characterName: string;
  characterImage: string;
  showAvatar: boolean;
  /** Solo el último mensaje de la chica ofrece "Continuar". */
  onContinue?: () => void;
};

/**
 * Mensaje de texto de la chica estilo novela: tarjeta gris ancha con el avatar afuera a la
 * izquierda, barra flotante de acciones arriba a la derecha y feedback / "Continuar" abajo.
 */
export default function AiMessageCard({
  text,
  createdAt,
  characterId,
  characterName,
  characterImage,
  showAvatar,
  onContinue,
}: Props) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const rate = (value: "up" | "down") => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    if (next) trackEvent("chat_message_feedback", { character_id: characterId, feedback: next });
  };

  return (
    <div className={`flex items-start gap-2.5 sm:gap-3 ${showAvatar ? "pt-3" : ""}`}>
      {showAvatar ? (
        <Avatar name={characterName} image={characterImage} size="sm" className="mt-0.5 ring-white/5" />
      ) : (
        <div className="w-10 shrink-0" aria-hidden="true" />
      )}
      <div className="group relative min-w-0 flex-1 sm:max-w-[720px]">
        <div className="absolute -top-3.5 right-3 z-10 flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#1c1c1f] px-1 py-0.5 shadow-md">
          <CopyMessageButton text={text} />
        </div>
        <div className="rounded-[20px] bg-[#2a2a2e] px-4 pb-2 pt-4 text-[16px] leading-[1.75] shadow-lg sm:px-5 sm:pt-5">
          <div className="break-words">
            <RoleplayText text={text} />
          </div>
          <div className="mt-2 flex items-center gap-1 text-zinc-500">
            {createdAt && (
              <span className="mr-auto text-[11px]">
                {new Date(createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => rate("up")}
                aria-label="Me gusta"
                className={`rounded-md p-1.5 transition-colors hover:bg-white/5 ${feedback === "up" ? "text-white" : "hover:text-zinc-200"}`}
              >
                <ThumbsUp className="h-4 w-4" fill={feedback === "up" ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => rate("down")}
                aria-label="No me gusta"
                className={`rounded-md p-1.5 transition-colors hover:bg-white/5 ${feedback === "down" ? "text-white" : "hover:text-zinc-200"}`}
              >
                <ThumbsDown className="h-4 w-4" fill={feedback === "down" ? "currentColor" : "none"} />
              </button>
              {onContinue && (
                <button
                  type="button"
                  onClick={onContinue}
                  className="ml-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/5 hover:text-zinc-200"
                >
                  <StepForward className="h-4 w-4" />
                  Continuar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
