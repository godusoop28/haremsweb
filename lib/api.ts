const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8080/api" : "");

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está configurada");
}

export const TOKEN_KEY = "harems_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // response had no JSON body
    }

    if (res.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export type Role = "USER" | "ADMIN";
export type PlanType = "FREE" | "TRIAL_3_DAYS" | "PREMIUM" | "VIP";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type AccessType = "FREE" | "PREMIUM" | "VIP";
export type SenderType = "USER" | "AI";

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
}

export interface SubscriptionResponse {
  plan: PlanType;
  status: SubscriptionStatus;
  expiresAt: string | null;
  imageCredits: number;
  messagesUsed: number;
}

export interface ImageGenerationResponse {
  id: number;
  imageUrl: string;
  characterSlug: string;
  status: string;
  creditsRemaining: number;
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

  generateImage(
    token: string,
    data: {
      characterSlug: string;
      userPrompt?: string;
      style?: string;
      mood?: string;
      aspectRatio?: string;
    }
  ) {
    return request<ImageGenerationResponse>("/images/generate", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },
};
