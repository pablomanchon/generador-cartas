"use client";

import { useCallback, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CardModel } from "../components/card/types";

export type PrintPick = {
  model: CardModel;
  qty: number;
};

type Options = {
  fileName?: string;

  // Tamaño final impreso de cada carta (en mm)
  cardWidthMm?: number;
  cardHeightMm?: number;

  // Separación entre cartas (en mm)
  gapMm?: number;

  // Márgenes página (en mm)
  marginMm?: number;

  // Calidad de captura
  pixelRatio?: number;

  // Marcas de corte
  cropMarks?: boolean;
  cropMarkLenMm?: number;
};

function waitNextFrame() {
  return new Promise<void>((r) => requestAnimationFrame(() => r()));
}

function addCropMarks(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  len: number
) {
  // líneas fuera de la carta: 8 segmentos (4 esquinas x 2)
  // arriba-izq
  pdf.line(x - len, y, x, y);
  pdf.line(x, y - len, x, y);
  // arriba-der
  pdf.line(x + w, y - len, x + w, y);
  pdf.line(x + w, y, x + w + len, y);
  // abajo-izq
  pdf.line(x - len, y + h, x, y + h);
  pdf.line(x, y + h, x, y + h + len);
  // abajo-der
  pdf.line(x + w, y + h, x + w + len, y + h);
  pdf.line(x + w, y + h, x + w, y + h + len);
}

export function useExportPrintPdf() {
  // este ref apunta al contenedor que envuelve la carta renderizada en oculto
  const hiddenCardRef = useRef<HTMLDivElement | null>(null);

  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // estado “modelo actual” lo controla el caller (la página/componente)
  // para que HiddenCardRenderer renderice ese modelo.
  // Si preferís, podés mover el estado acá; pero suele ser más simple manejarlo en la page.
  const exportPdf = useCallback(
    async (
      picks: PrintPick[],
      setCurrentModel: (m: CardModel) => void,
      opts?: Options
    ) => {
      const {
        fileName = "cartas",
        cardWidthMm = 63,
        cardHeightMm = 88,
        gapMm = 4,
        marginMm = 8,
        pixelRatio = 2,
        cropMarks = true,
        cropMarkLenMm = 3,
      } = opts ?? {};

      try {
        setIsBuilding(true);
        setError(null);

        const normalized = picks
          .filter((p) => p.qty > 0)
          .map((p) => ({ ...p, qty: Math.floor(p.qty) }));

        if (normalized.length === 0) {
          throw new Error("No hay cantidades seleccionadas.");
        }

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        const usableW = pageW - marginMm * 2;
        const usableH = pageH - marginMm * 2;

        const cellW = cardWidthMm;
        const cellH = cardHeightMm;

        const cols = Math.max(1, Math.floor((usableW + gapMm) / (cellW + gapMm)));
        const rows = Math.max(1, Math.floor((usableH + gapMm) / (cellH + gapMm)));
        const perPage = cols * rows;

        // Expandimos la lista según qty
        const queue: CardModel[] = [];
        for (const p of normalized) {
          for (let i = 0; i < p.qty; i++) queue.push(p.model);
        }

        let idx = 0;
        let pageIndex = 0;

        while (idx < queue.length) {
          if (pageIndex > 0) pdf.addPage();

          for (let slot = 0; slot < perPage && idx < queue.length; slot++, idx++) {
            const m = queue[idx];

            // 1) renderizar ese modelo en el hidden renderer
            setCurrentModel(m);

            // 2) esperar pintura
            await waitNextFrame();
            await waitNextFrame();

            const el = hiddenCardRef.current;
            if (!el) throw new Error("No se encontró el nodo para capturar la carta.");

            // 3) capturar imagen
            const canvas = await html2canvas(el, {
              backgroundColor: null,
              scale: pixelRatio,
              useCORS: true,
              allowTaint: true,
            });

            const imgData = canvas.toDataURL("image/png");

            // 4) calcular posición en grilla
            const r = Math.floor(slot / cols);
            const c = slot % cols;

            const x = marginMm + c * (cellW + gapMm);
            const y = marginMm + r * (cellH + gapMm);

            // 5) insertar en PDF
            pdf.addImage(imgData, "PNG", x, y, cellW, cellH, undefined, "FAST");

            // 6) marcas de corte
            if (cropMarks) {
              pdf.setDrawColor(0);
              pdf.setLineWidth(0.2);
              addCropMarks(pdf, x, y, cellW, cellH, cropMarkLenMm);
            }
          }

          pageIndex++;
        }

        pdf.save(`${fileName}.pdf`);
      } catch (e: any) {
        setError(e?.message ?? "Error generando PDF");
      } finally {
        setIsBuilding(false);
      }
    },
    []
  );

  return {
    hiddenCardRef,
    exportPdf,
    isBuilding,
    error,
  };
}