"use client";

import { useCallback, useMemo, useState } from "react";
import html2canvas from "html2canvas";

type ExportOptions = {
  fileName?: string;
  pixelRatio?: number;
  backgroundColor?: string;

  // ✅ NUEVO
  download?: boolean;                 // default true
  format?: "png" | "jpeg";            // default "png"
  quality?: number;                   // default 0.95 (jpeg)
  mode?: "normal" | "print";          // ✅ normal aplica micro-ajustes; print NO
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

      const mode = opts?.mode ?? "normal";
      const format = opts?.format ?? "png";
      const shouldDownload = opts?.download ?? true;

      try {
        setIsExporting(true);
        setError(null);

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

            // ✅ Apagar SOLO lo conflictivo
            const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
            for (const el of all) {
              (el.style as any).backdropFilter = "none";
              (el.style as any).webkitBackdropFilter = "none";
              // podés dejar sombras si querés, pero si te dan problemas:
              // el.style.boxShadow = "none";
            }

            // Fuente consistente
            root.style.fontFamily =
              'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif';

            // ✅ SOLO en modo normal (si todavía querés esos parches)
            if (mode === "normal") {
              const pillTexts = root.querySelectorAll<HTMLElement>(
                '[data-pill="1"] span, [data-pill="1"] div, [data-pill="1"] p'
              );
              pillTexts.forEach((el) => {
                el.style.transform = "translateY(-3px)";
              });

              const titleText = root.querySelector<HTMLElement>('[data-pill="1"] .truncate');
              if (titleText) {
                titleText.style.lineHeight = "2.2";
                titleText.style.transform = "translateY(-5px)";
              }

              const descText = root.querySelector<HTMLElement>(".desc-text");
              if (descText) {
                descText.style.transform = "translateY(-8px)";
              }
            }

            // ✅ EN PRINT: asegurá que NO haya transforms raros heredados
            if (mode === "print") {
              const texts = root.querySelectorAll<HTMLElement>("[data-pill='1'] *");
              texts.forEach((el) => {
                if (el.style.transform) el.style.transform = "none";
              });
            }
          },
        });

        const dataUrl =
          format === "jpeg"
            ? canvas.toDataURL("image/jpeg", opts?.quality ?? 0.95)
            : canvas.toDataURL("image/png");

        if (shouldDownload) {
          const ext = format === "jpeg" ? "jpg" : "png";
          const fileName = safeFileName(opts?.fileName ?? defaultName) + "." + ext;

          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }

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