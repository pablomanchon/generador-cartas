"use client";

import { useCallback, useMemo, useState } from "react";
import html2canvas from "html2canvas";

type ExportOptions = {
  fileName?: string;
  pixelRatio?: number;
  backgroundColor?: string;
};

function safeFileName(name: string) {
  const cleaned = (name ?? "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
  return cleaned || "carta";
}

export function useExportCardPng(
  cardRef: React.RefObject<HTMLDivElement | null>,
  defaultTitle?: string
) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultName = useMemo(
    () => safeFileName(defaultTitle ?? "carta"),
    [defaultTitle]
  );

  const exportPng = useCallback(
    async (opts?: ExportOptions) => {
      const node = cardRef.current;
      if (!node) {
        setError("No se encontró la carta.");
        return;
      }

      try {
        setIsExporting(true);
        setError(null);

        // ✅ esperar fuentes
        if ("fonts" in document) {
          // @ts-ignore
          await document.fonts.ready;
        }

        const canvas = await html2canvas(node, {
          scale: opts?.pixelRatio ?? 2,
          useCORS: true,
          backgroundColor: opts?.backgroundColor ?? null,
          logging: false,

          onclone: (clonedDoc) => {
            const root = clonedDoc.getElementById("card-export") as HTMLElement | null;
            if (!root) return;

            // 1) Apagar cosas problemáticas (como ya venías haciendo)
            const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
            for (const el of all) {
              (el.style as any).backdropFilter = "none";
              (el.style as any).webkitBackdropFilter = "none";
              el.style.boxShadow = "none";
              el.style.textShadow = "none";
              el.style.outline = "none";
            }

            // 2) Forzar fuente consistente en el clon (clave)
            // Usá la misma que ves en pantalla. Si estás con Geist, dejalo así:
            root.style.fontFamily =
              'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif';

            // 3) Micro-ajuste vertical SOLO para textos en pills
            // Esto corrige el baseline que html2canvas dibuja más abajo.
            const pillTexts = root.querySelectorAll<HTMLElement>(
              '[data-pill="1"] span, [data-pill="1"] div, [data-pill="1"] p'
            );

            pillTexts.forEach((el) => {
              // No toco posiciones, solo el “dibujo” del texto
              el.style.transform = "translateY(-3px)";
            });

            const titleText = root.querySelector<HTMLElement>('[data-pill="1"] .truncate');
            if (titleText) {
              titleText.style.lineHeight = "2.2";
              titleText.style.transform = "translateY(-5px)";
            }

            const descText = root.querySelector<HTMLElement>(".desc-text");
            if (descText) {
              // Ajuste fino: probá -3px / -4px según lo que veas
              descText.style.transform = "translateY(-8px)";
              // opcional: si te queda “alto” o raro
              // descText.style.lineHeight = "1.15";
            }
          }
        });

        const dataUrl = canvas.toDataURL("image/png");
        const fileName = safeFileName(opts?.fileName ?? defaultName) + ".png";

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

        return dataUrl;
      } catch (e: any) {
        console.error("EXPORT ERROR:", e);
        setError(e?.message ?? "No se pudo exportar la carta.");
      } finally {
        setIsExporting(false);
      }
    },
    [cardRef, defaultName]
  );

  return { exportPng, isExporting, error };
}