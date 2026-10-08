"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type FreeMessageStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export type FreeMessageMap = Record<string, FreeMessageStatus>;

// Una sola petición compartida por todas las tarjetas de la página (por token).
let cache: { key: string; promise: Promise<FreeMessageMap> } | null = null;

function load(token: string | null): Promise<FreeMessageMap> {
  const key = token ?? "anon";
  if (!cache || cache.key !== key) {
    const promise = api
      .getFreeMessageStatuses(token)
      .then((list) => Object.fromEntries(list.map((s) => [s.characterId, s])))
      .catch(() => {
        cache = null;
        return {} as FreeMessageMap;
      });
    cache = { key, promise };
  }
  return cache.promise;
}

/** Fuerza a que la próxima lectura vuelva a pedir el estado al backend (p.ej. tras enviar mensajes). */
export function invalidateFreeMessages() {
  cache = null;
}

/**
 * Estado de la prueba gratuita (mensajes gratis por personaje) de la sesión actual.
 * El backend decide; esto solo lo muestra.
 */
export function useFreeMessages() {
  const { token, loading } = useAuth();
  const [statuses, setStatuses] = useState<FreeMessageMap>({});

  useEffect(() => {
    if (loading) return;
    let active = true;
    load(token).then((map) => {
      if (active) setStatuses(map);
    });
    return () => {
      active = false;
    };
  }, [token, loading]);

  const update = useCallback((status: FreeMessageStatus) => {
    invalidateFreeMessages();
    setStatuses((prev) => ({ ...prev, [status.characterId]: status }));
  }, []);

  return { statuses, update };
}

/** ¿Puede chatear con este personaje usando la prueba gratuita ahora mismo? */
export function isTrialAvailable(status: FreeMessageStatus | undefined): boolean {
  return !!status && status.freeTrialApplies && status.remaining > 0;
}

/**
 * Texto corto para tarjetas/listados, o null si el plan da acceso completo a ese personaje o si
 * el personaje no entra en la prueba (exclusivas VIP como Victoria).
 */
export function freeTrialLabel(status: FreeMessageStatus | undefined): string | null {
  if (!status || status.hasPaidAccess || status.requiredPlan) return null;
  if (status.remaining <= 0) return "Prueba finalizada";
  if (status.used === 0) return `${status.limit} mensajes gratis`;
  return status.remaining === 1 ? "1 mensaje restante" : `${status.remaining} mensajes restantes`;
}
