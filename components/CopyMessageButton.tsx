"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Botón pequeño para copiar el texto de un mensaje del chat (sin los asteriscos de acción). */
export default function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/\*/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // El portapapeles puede no estar disponible (contexto inseguro); se ignora.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
      title={copied ? "Copiado" : "Copiar mensaje"}
      aria-label="Copiar mensaje"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-cyan-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
