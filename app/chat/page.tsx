import type { Metadata } from "next";
import ChatClient from "./ChatClient";
import { characters } from "@/lib/data";

export const metadata: Metadata = {
  title: "Chat demo — HAREMS",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const requested = typeof params.personaje === "string" ? params.personaje : undefined;
  const initialId = characters.find((c) => c.id === requested)?.id ?? characters[0].id;

  return <ChatClient initialId={initialId} />;
}
