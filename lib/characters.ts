import { characters as localCharacters, type Character, type Access } from "@/lib/data";
import { api, type AccessType } from "@/lib/api";

const accessLabel: Record<AccessType, Access> = {
  FREE: "Gratis",
  PREMIUM: "Premium",
  VIP: "Premium / VIP",
};

export async function getMergedCharacters(): Promise<Character[]> {
  try {
    const backend = await api.getCharacters();
    return localCharacters.map((local) => {
      const remote = backend.find((b) => b.slug === local.id);
      if (!remote) return local;
      return {
        ...local,
        access: accessLabel[remote.accessType],
        isPremium: remote.isPremium,
        difficulty: remote.difficulty || local.difficulty,
      };
    });
  } catch {
    return localCharacters;
  }
}

export async function getMergedCharacter(id: string): Promise<Character | undefined> {
  const local = localCharacters.find((c) => c.id === id);
  if (!local) return undefined;

  try {
    const remote = await api.getCharacter(id);
    return {
      ...local,
      access: accessLabel[remote.accessType],
      isPremium: remote.isPremium,
      difficulty: remote.difficulty || local.difficulty,
    };
  } catch {
    return local;
  }
}
