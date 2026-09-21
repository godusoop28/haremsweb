/**
 * Descarga una imagen generada al dispositivo del usuario antes de que expire (no hay storage
 * propio — ver GeneratedImage). Usa fetch+blob en vez de un simple <a download> porque el CDN de
 * Runware no manda Content-Disposition, así que un <a download> cross-origin normalmente solo
 * abriría la imagen en una pestaña nueva en vez de forzar la descarga.
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: si fetch falla (p.ej. CORS), al menos abrir la imagen para que el usuario
    // pueda guardarla a mano (clic derecho → guardar imagen).
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
