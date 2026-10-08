/**
 * Eventos de producto (free_chat_started, free_message_sent, free_messages_exhausted,
 * plans_cta_clicked, ...). No hay una herramienta de analítica instalada todavía: si en el futuro
 * se agrega Google Tag Manager / gtag / Meta Pixel en el layout, estos eventos les llegan solos.
 * Sin ninguno instalado es un no-op — nunca rompe la UI.
 */
type EventProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...props });
    } else if (typeof window.gtag === "function") {
      window.gtag("event", name, props);
    }
  } catch {
    // La analítica nunca debe interrumpir la experiencia.
  }
}
