const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "https://haremapi-k180.onrender.com/api" : "");

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está configurada");
}

export const TOKEN_KEY = "harems_token";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    let message = "Ocurrió un error inesperado. Inténtalo más tarde.";
    let code: string | undefined;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
      if (data?.code) code = data.code;
    } catch {
      // response had no JSON body
    }

    if (res.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    throw new ApiError(message, res.status, code);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export type Role = "USER" | "ADMIN";
export type PlanType = "FREE" | "TRIAL_3_DAYS" | "PREMIUM" | "VIP";
export type SubscriptionStatus =
  | "FREE"
  | "PENDING"
  | "ACTIVE"
  | "CANCEL_PENDING"
  | "CANCELLED"
  | "SUSPENDED"
  | "EXPIRED"
  | "PAST_DUE";
export type AccessType = "FREE" | "PREMIUM" | "VIP";
export type SenderType = "USER" | "AI";
export type MessageType = "TEXT" | "IMAGE" | "SYSTEM";
export type AdultLevel = "SAFE" | "NUDE";
export type RelationshipStatus = "DESCONOCIDA" | "CURIOSA" | "INTERESADA" | "CONFIADA" | "CONEXION_ESPECIAL";

export const relationshipStatusLabels: Record<RelationshipStatus, string> = {
  DESCONOCIDA: "Desconocida",
  CURIOSA: "Curiosa",
  INTERESADA: "Interesada",
  CONFIADA: "Confiada",
  CONEXION_ESPECIAL: "Conexión especial",
};

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  plan: PlanType;
  ageVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface CharacterResponse {
  id: number;
  slug: string;
  name: string;
  age: number;
  archetype: string;
  accessType: AccessType;
  difficulty: string;
  imageUrl: string;
  shortDescription: string;
  personality: string;
  greeting: string;
  conquestTip: string;
  isPremium: boolean;
  isVip: boolean;
  imageGenerationEnabled: boolean;
}

export interface MessageResponse {
  id: number;
  sender: SenderType;
  content: string;
  messageType: MessageType;
  imageUrl: string | null;
  imageGenerationId: number | null;
  createdAt: string;
}

export interface ConversationResponse {
  id: number;
  characterSlug: string;
  characterName: string;
  characterImageUrl: string;
  createdAt: string;
  updatedAt: string;
  messages: MessageResponse[];
}

export interface ChatResponse {
  conversationId: number;
  reply: string;
  messagesUsed: number;
  messagesLimit: number | null;
  connectionLevel: number;
  relationshipStatus: RelationshipStatus;
  connectionLeveledUp: boolean;
}

export interface RelationshipResponse {
  characterSlug: string;
  characterName: string;
  connectionPoints: number;
  connectionLevel: number;
  maxLevel: number;
  relationshipStatus: RelationshipStatus;
  progressPercent: number;
  nextLevelAt: number | null;
  totalUserMessages: number;
  totalAiMessages: number;
  imagesGenerated: number;
  firstInteractionAt: string | null;
  lastInteractionAt: string | null;
}

export type ImageLimitPeriod = "NONE" | "DAILY" | "WEEKLY";

export interface SubscriptionResponse {
  plan: PlanType;
  status: SubscriptionStatus;
  expiresAt: string | null;
  /** Créditos extra (wallet independiente del plan, comprado aparte). */
  imageCredits: number;
  messagesUsed: number;
  imagesUsedThisPeriod: number;
  imagesLimitPerPeriod: number;
  imageLimitPeriod: ImageLimitPeriod;
  imagePeriodResetAt: string | null;
  billingProvider: string | null;
  subscriptionId: number | null;
  paypalSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
  canCancel: boolean;
}

export interface PlanInfoResponse {
  plan: PlanType;
  name: string;
  priceMxn: number;
  /** Precio de lista anterior a la promo vigente, o null si el plan no tiene descuento. */
  originalPriceMxn: number | null;
  imagesPerPeriod: number;
  imageLimitPeriod: ImageLimitPeriod;
  maxAdultLevel: AdultLevel | null;
  durationDays: number | null;
}

export interface PayPalSubscriptionResponse {
  provider: string;
  plan: PlanType;
  paypalPlanId: string;
  paypalSubscriptionId: string;
  approvalUrl: string;
  status: string;
}

export interface ImageGenerationResponse {
  id: number;
  imageUrl: string;
  characterSlug: string;
  status: string;
  imagesUsedThisPeriod: number;
  imagesLimitPerPeriod: number;
  imageLimitPeriod: ImageLimitPeriod;
  extraCreditsRemaining: number;
  usedExtraCredit: boolean;
  connectionLevel: number;
  relationshipStatus: RelationshipStatus;
  connectionLeveledUp: boolean;
}

export interface ImageGalleryItemResponse {
  id: number;
  imageUrl: string;
  characterSlug: string;
  characterName: string;
  characterImageUrl: string;
  adultLevel: AdultLevel | null;
  status: string;
  usedExtraCredit: boolean;
  createdAt: string;
}

export type CreditTransactionType =
  | "GRANT"
  | "SPEND"
  | "REFUND"
  | "ADJUSTMENT"
  | "EXPIRE"
  | "REVERSAL";

export type CreditProvider =
  | "INTERNAL"
  | "PAYPAL"
  | "FAL"
  | "RUNWARE"
  | "OPENROUTER"
  | "SYSTEM";

export interface ExtraCreditPackage {
  id: string;
  credits: number;
  priceMxn: number;
}

export type CreditPurchaseStatus = "CREATED" | "APPROVED" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface CreditPurchaseResponse {
  id: number;
  packageId: string;
  credits: number;
  amount: number;
  currency: string;
  paypalOrderId: string;
  status: CreditPurchaseStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface CreditBalanceResponse {
  imageCredits: number;
}

export interface CreateCreditOrderResponse {
  provider: string;
  packageId: string;
  credits: number;
  amountMxn: number;
  paypalOrderId: string;
  approvalUrl: string;
  status: string;
}

export interface CreditTransactionResponse {
  id: number;
  type: CreditTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  provider: CreditProvider;
  providerJobId: string | null;
  relatedPaymentId: number | null;
  relatedImageGenerationId: number | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Admin ─────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "ACTIVE"
  | "CANCEL_PENDING"
  | "CANCELLED"
  | "SUSPENDED"
  | "PAST_DUE"
  | "EXPIRED"
  | "FAILED"
  | "REFUNDED";

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  plan: PlanType;
  planExpiresAt: string | null;
  /** Créditos extra (wallet independiente del plan). */
  imageCredits: number;
  messagesUsed: number;
  imagesUsedThisPeriod: number;
  imagesLimitPerPeriod: number;
  imageLimitPeriod: ImageLimitPeriod;
  ageVerified: boolean;
  createdAt: string;
  active: boolean;
  deletedAt: string | null;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  activeUsers: number;
  newUsersLast30Days: number;
  usersByPlan: Partial<Record<PlanType, number>>;
  activeSubscriptionsByPlan: Partial<Record<PlanType, number>>;
  estimatedMonthlyRevenueMxn: number;
  revenueByPlanMxn: Partial<Record<PlanType, number>>;
  totalImagesGenerated: number;
  totalConversations: number;
  totalMessages: number;
  totalCreditsGranted: number;
  totalCreditsSpent: number;
  paymentsByStatus: Partial<Record<PaymentStatus, number>>;
}

export interface AdminConversationResponse {
  id: number;
  userEmail: string;
  characterSlug: string;
  characterName: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminImageGenerationResponse {
  id: number;
  userEmail: string;
  characterSlug: string;
  userPrompt: string | null;
  promptFinal: string;
  imageUrl: string | null;
  status: string;
  provider: string;
  model: string | null;
  costUsd: number | null;
  creditsCost: number;
  errorCode: string | null;
  errorMessage: string | null;
  usedReferenceImage: boolean | null;
  usedPulid: boolean | null;
  durationMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

export const api = {
  register(data: { name: string; email: string; password: string; ageVerified: boolean }) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me(token: string) {
    return request<UserResponse>("/auth/me", { token });
  },

  getCharacters() {
    return request<CharacterResponse[]>("/characters");
  },

  getCharacter(slug: string) {
    return request<CharacterResponse>(`/characters/${slug}`);
  },

  sendChatMessage(token: string, data: { characterSlug: string; message: string }) {
    return request<ChatResponse>("/chat/send", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  getConversations(token: string) {
    return request<ConversationResponse[]>("/conversations", { token });
  },

  getConversation(token: string, id: number) {
    return request<ConversationResponse>(`/conversations/${id}`, { token });
  },

  getSubscription(token: string) {
    return request<SubscriptionResponse>("/subscriptions/me", { token });
  },

  simulateSubscription(token: string, plan: PlanType) {
    return request<SubscriptionResponse>("/subscriptions/simulate", {
      method: "POST",
      token,
      body: JSON.stringify({ plan }),
    });
  },

  createPayPalSubscription(token: string, plan: PlanType) {
    return request<PayPalSubscriptionResponse>("/payments/paypal/create-subscription", {
      method: "POST",
      token,
      body: JSON.stringify({ plan }),
    });
  },

  confirmPayPalSubscription(token: string, subscriptionId: string) {
    return request<SubscriptionResponse>("/payments/paypal/confirm-subscription", {
      method: "POST",
      token,
      body: JSON.stringify({ subscriptionId }),
    });
  },

  cancelPayPalSubscription(token: string) {
    return request<void>("/payments/paypal/cancel-subscription", {
      method: "POST",
      token,
    });
  },

  getCreditTransactions(token: string, page = 0, size = 10) {
    return request<PageResponse<CreditTransactionResponse>>(
      `/credits/transactions/me?page=${page}&size=${size}`,
      { token }
    );
  },

  getExtraCreditPackages(token: string) {
    return request<ExtraCreditPackage[]>("/credits/packages", { token });
  },

  getCreditBalance(token: string) {
    return request<CreditBalanceResponse>("/credits/balance", { token });
  },

  getCreditPurchases(token: string, page = 0, size = 10) {
    return request<PageResponse<CreditPurchaseResponse>>(
      `/credits/purchases?page=${page}&size=${size}`,
      { token }
    );
  },

  createCreditOrder(token: string, packageId: string) {
    return request<CreateCreditOrderResponse>("/payments/paypal/create-credit-order", {
      method: "POST",
      token,
      body: JSON.stringify({ packageId }),
    });
  },

  captureCreditOrder(token: string, orderId: string) {
    return request<CreditPurchaseResponse>("/payments/paypal/capture-credit-order", {
      method: "POST",
      token,
      body: JSON.stringify({ orderId }),
    });
  },

  generateImage(
    token: string,
    data: {
      characterSlug: string;
      userPrompt?: string;
      style?: string;
      mood?: string;
      aspectRatio?: string;
      adultLevel?: "SAFE" | "NUDE";
      scene?: string;
      pose?: string;
    }
  ) {
    return request<ImageGenerationResponse>("/images/generate", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  getRelationships(token: string) {
    return request<RelationshipResponse[]>("/relationships", { token });
  },

  getRelationship(token: string, characterSlug: string) {
    return request<RelationshipResponse>(`/relationships/${characterSlug}`, { token });
  },

  getPlans() {
    return request<PlanInfoResponse[]>("/plans");
  },

  getMyImages(token: string, filters: { characterSlug?: string; page?: number; size?: number } = {}) {
    const params = new URLSearchParams();
    if (filters.characterSlug) params.set("characterSlug", filters.characterSlug);
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 24));
    return request<PageResponse<ImageGalleryItemResponse>>(`/images/mine?${params.toString()}`, { token });
  },

  // ── Cuenta (autogestión) ──────────────────────────────────────────────────

  updateName(token: string, name: string) {
    return request<UserResponse>("/account/name", {
      method: "PATCH",
      token,
      body: JSON.stringify({ name }),
    });
  },

  changePassword(token: string, currentPassword: string, newPassword: string) {
    return request<void>("/account/change-password", {
      method: "POST",
      token,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  deleteAccount(token: string, password: string) {
    return request<void>("/account", {
      method: "DELETE",
      token,
      body: JSON.stringify({ password }),
    });
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  getAdminDashboard(token: string) {
    return request<AdminDashboardResponse>("/admin/dashboard", { token });
  },

  getAdminUsers(token: string) {
    return request<AdminUserResponse[]>("/admin/users", { token });
  },

  getAdminUser(token: string, id: number) {
    return request<AdminUserResponse>(`/admin/users/${id}`, { token });
  },

  createAdminUser(token: string, data: { name: string; email: string; password: string; role: Role }) {
    return request<AdminUserResponse>("/admin/users", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  updateAdminUserRole(token: string, id: number, role: Role) {
    return request<AdminUserResponse>(`/admin/users/${id}/role`, {
      method: "PUT",
      token,
      body: JSON.stringify({ role }),
    });
  },

  updateAdminUserActive(token: string, id: number, active: boolean) {
    return request<AdminUserResponse>(`/admin/users/${id}/active`, {
      method: "PUT",
      token,
      body: JSON.stringify({ active }),
    });
  },

  updateAdminUserPlan(token: string, id: number, plan: PlanType) {
    return request<AdminUserResponse>(`/admin/users/${id}/plan`, {
      method: "PUT",
      token,
      body: JSON.stringify({ plan }),
    });
  },

  deleteAdminUser(token: string, id: number) {
    return request<void>(`/admin/users/${id}`, {
      method: "DELETE",
      token,
    });
  },

  getAdminCreditTransactions(
    token: string,
    filters: { userId?: number; email?: string; type?: CreditTransactionType; page?: number; size?: number } = {}
  ) {
    const params = new URLSearchParams();
    if (filters.userId != null) params.set("userId", String(filters.userId));
    if (filters.email) params.set("email", filters.email);
    if (filters.type) params.set("type", filters.type);
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 50));
    return request<PageResponse<CreditTransactionResponse>>(`/admin/credits/transactions?${params.toString()}`, {
      token,
    });
  },

  adjustAdminCredits(token: string, data: { userId: number; amount: number; reason: string }) {
    return request<CreditTransactionResponse>("/admin/credits/adjust", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  getAdminConversations(token: string) {
    return request<AdminConversationResponse[]>("/admin/conversations", { token });
  },

  getAdminImageGenerations(token: string) {
    return request<AdminImageGenerationResponse[]>("/admin/image-generations", { token });
  },
};
