import { Fragment } from "react";

type Segment = { kind: "action" | "speech"; text: string };

// Parte un párrafo en acciones (*entre asteriscos*) y diálogo. Un asterisco sin cerrar
// se trata como texto normal para no dejar media frase en cursiva.
function parseSegments(paragraph: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(paragraph)) !== null) {
    if (match.index > last) segments.push({ kind: "speech", text: paragraph.slice(last, match.index) });
    segments.push({ kind: "action", text: match[1].trim() });
    last = match.index + match[0].length;
  }
  if (last < paragraph.length) segments.push({ kind: "speech", text: paragraph.slice(last) });
  return segments
    .map((s) => (s.kind === "speech" ? { ...s, text: s.text.replace(/\*/g, "").trim() } : s))
    .filter((s) => s.text.length > 0);
}

/**
 * Renderiza un mensaje de roleplay estilo novela: las acciones en cursiva y tono tenue,
 * el diálogo en texto brillante, y cada párrafo (separado por línea en blanco) en su bloque.
 */
export default function RoleplayText({ text, variant = "ai" }: { text: string; variant?: "ai" | "user" }) {
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const actionClass = variant === "user" ? "italic text-white/60" : "italic text-zinc-400";
  const speechClass = "text-white";

  return (
    <div className="space-y-4 whitespace-normal">
      {paragraphs.map((paragraph, pIdx) => (
        <p key={pIdx}>
          {parseSegments(paragraph).map((segment, sIdx) => (
            <Fragment key={sIdx}>
              {sIdx > 0 && " "}
              <span className={segment.kind === "action" ? actionClass : speechClass}>{segment.text}</span>
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
