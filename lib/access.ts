import type { Access } from "@/lib/data";
import type { AccessType, PlanType } from "@/lib/api";

/** Fuente única de las jerarquías de plan/acceso — antes duplicada en 4 componentes distintos. */
export const PLAN_RANK: Record<PlanType, number> = {
  FREE: 0,
  TRIAL_3_DAYS: 1,
  PREMIUM: 1,
  VIP: 2,
};

/** Jerarquía usando el label de acceso editorial local (Character["access"]). */
export const ACCESS_LABEL_RANK: Record<Access, number> = {
  Gratis: 0,
  Premium: 1,
  "Premium / VIP": 2,
};

/** Jerarquía usando el accessType tal como lo entrega el backend (CharacterResponse["accessType"]). */
export const ACCESS_TYPE_RANK: Record<AccessType, number> = {
  FREE: 0,
  PREMIUM: 1,
  VIP: 2,
};

export function canAccessLabel(plan: PlanType | undefined, access: Access): boolean {
  return PLAN_RANK[plan ?? "FREE"] >= ACCESS_LABEL_RANK[access];
}

export function canAccessType(plan: PlanType | undefined, accessType: AccessType): boolean {
  return PLAN_RANK[plan ?? "FREE"] >= ACCESS_TYPE_RANK[accessType];
}
