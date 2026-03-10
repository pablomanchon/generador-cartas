"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import type { CardModel } from "./card/types";
import { CardCanvas } from "./card/CardCanvas";
import { getImage, blobToDataURL } from "./card/imageStore";
import { HiddenCardRenderer } from "./card/HiddenCardRenderer";
import { getExportDataUrl, setExportBlob } from "../storage/exportCache";

type Props = {
  items: CardModel[];
  onLoad: (m: CardModel) => void;
  onDelete: (id: string) => void;
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

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
  pdf.line(x - len, y, x, y);
  pdf.line(x, y - len, x, y);

  pdf.line(x + w, y - len, x + w, y);
  pdf.line(x + w, y, x + w + len, y);

  pdf.line(x - len, y + h, x, y + h);
  pdf.line(x, y + h, x, y + h + len);

  pdf.line(x + w, y + h, x + w + len, y + h);
  pdf.line(x + w, y + h, x + w, y + h + len);
}

export function Gallery({ items, onLoad, onDelete }: Props) {
  const [qtyById, setQtyById] = useState<Record<string, number>>({});
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [thumbUrlById, setThumbUrlById] = useState<Record<string, string>>({});

  const [currentModel, setCurrentModel] = useState<CardModel | null>(null);
  const [currentExportImageUrl, setCurrentExportImageUrl] = useState<string | null>(
    null
  );

  const hiddenCardRef = useRef<HTMLDivElement | null>(null);

  function openPrintPage() {
    const job = {
      items: picks.map((p) => ({ id: p.model.id, qty: p.qty })),
    };
    sessionStorage.setItem("cc_print_job_v1", JSON.stringify(job));
    window.open("/print", "_blank");
  }

  useEffect(() => {
    let alive = true;

    async function run() {
      const prev = thumbUrlById;
      const next: Record<string, string> = {};

      for (const m of items) {
        if (prev[m.id]) {
          next[m.id] = prev[m.id];
          continue;
        }
        if (!m.imageKey) continue;

        const blob = await getImage(m.imageKey);
        if (!alive) return;
        if (!blob) continue;

        next[m.id] = URL.createObjectURL(blob);
      }

      if (!isBuildingPdf) {
        for (const id of Object.keys(prev)) {
          if (!next[id]) URL.revokeObjectURL(prev[id]);
        }
      }

      if (alive) setThumbUrlById(next);
    }

    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isBuildingPdf]);

  useEffect(() => {
    return () => {
      for (const u of Object.values(thumbUrlById)) URL.revokeObjectURL(u);
    };
  }, [thumbUrlById]);

  const picks = useMemo(
    () =>
      items
        .map((m) => ({ model: m, qty: qtyById[m.id] ?? 0 }))
        .filter((p) => p.qty > 0),
    [items, qtyById]
  );

  const total = useMemo(() => picks.reduce((acc, p) => acc + p.qty, 0), [picks]);

  async function ensureExport(model: CardModel) {
    const cached = await getExportDataUrl(model.id);
    if (cached) return cached;

    let exportUrl: string | null = null;
    if (model.imageKey) {
      const blob = await getImage(model.imageKey);
      if (blob) exportUrl = await blobToDataURL(blob);
    }

    setCurrentModel(model);
    setCurrentExportImageUrl(exportUrl);

    await waitNextFrame();
    await waitNextFrame();
    await sleep(80);

    const node = hiddenCardRef.current;
    if (!node) throw new Error("hiddenCardRef está null.");

    const html = node.outerHTML;

    const res = await fetch("/api/png", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        width: 1000,
        height: 1680,
        deviceScaleFactor: 2,
        transparent: false,
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const pngBlob = await res.blob();

    await setExportBlob(model.id, pngBlob);

    return await blobToDataURL(pngBlob);
  }

  async function handleGeneratePdf() {
    try {
      setIsBuildingPdf(true);
      setPdfError(null);

      if (picks.length === 0) {
        setPdfError("Elegí cantidades antes de generar el PDF.");
        return;
      }

      const uniqueModels = Array.from(
        new Map(picks.map((p) => [p.model.id, p.model])).values()
      );

      const exportMap = new Map<string, string>();

      for (const model of uniqueModels) {
        const dataUrl = await ensureExport(model);
        exportMap.set(model.id, dataUrl);
      }

      const cardWidthMm = 63;
      const cardHeightMm = 94;
      const gapMm = 2;
      const marginMm = 5;
      const cropMarks = true;
      const cropMarkLenMm = 3;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageH = pdf.internal.pageSize.getHeight();
      const usableH = pageH - marginMm * 2;

      const cols = 3;
      const rows = Math.max(1, Math.floor((usableH + gapMm) / (cardHeightMm + gapMm)));
      const perPage = cols * rows;

      const queue: CardModel[] = [];
      for (const p of picks) {
        for (let i = 0; i < p.qty; i++) queue.push(p.model);
      }

      let idx = 0;
      let pageIndex = 0;

      while (idx < queue.length) {
        if (pageIndex > 0) pdf.addPage();

        for (let slot = 0; slot < perPage && idx < queue.length; slot++, idx++) {
          const model = queue[idx];

          const imgData = exportMap.get(model.id) ?? (await getExportDataUrl(model.id));
          if (!imgData) {
            throw new Error(
              `No se encontró el export cacheado de "${model.title || model.id}".`
            );
          }

          const r = Math.floor(slot / cols);
          const c = slot % cols;
          const x = marginMm + c * (cardWidthMm + gapMm);
          const y = marginMm + r * (cardHeightMm + gapMm);

          pdf.addImage(imgData, "PNG", x, y, cardWidthMm, cardHeightMm, undefined, "FAST");

          if (cropMarks) {
            pdf.setDrawColor(0);
            pdf.setLineWidth(0.2);
            addCropMarks(pdf, x, y, cardWidthMm, cardHeightMm, cropMarkLenMm);
          }
        }

        pageIndex++;
      }

      pdf.save("cartas-para-imprimir.pdf");
    } catch (e: any) {
      setPdfError(e?.message ?? "Error generando el PDF.");
      console.error(e);
    } finally {
      setIsBuildingPdf(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-foreground/15 bg-foreground/5 p-4">
      {currentModel ? (
        <HiddenCardRenderer
          model={currentModel}
          imageUrl={currentExportImageUrl}
          cardRef={hiddenCardRef}
        />
      ) : null}

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Galería</h2>
          <span className="text-xs opacity-70">{items.length} guardadas</span>
          <span className="text-xs opacity-70">•</span>
          <span className="text-xs font-medium">Total a imprimir: {total}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isBuildingPdf || total === 0}
            className="rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10 disabled:opacity-50"
          >
            {isBuildingPdf ? "Generando PDF..." : "Generar PDF"}
          </button>

          <button
            type="button"
            onClick={() => setQtyById({})}
            disabled={isBuildingPdf || Object.keys(qtyById).length === 0}
            className="rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10 disabled:opacity-50"
          >
            Limpiar cantidades
          </button>
        </div>
      </div>

      {pdfError ? <p className="mb-3 text-sm text-red-500">{pdfError}</p> : null}

      {items.length === 0 ? (
        <p className="text-sm opacity-80">Todavía no guardaste ninguna carta.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
          {items.map((m) => {
            const qty = qtyById[m.id] ?? 0;
            const thumbUrl = thumbUrlById[m.id] ?? null;

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-foreground/15 bg-background p-3 w-87"
              >
                <div className="overflow-hidden rounded-2xl border border-foreground/15 bg-black">
                  <div className="scale-75 flex items-center">
                    <CardCanvas
                      title={m.title}
                      imageUrl={thumbUrl}
                      stats={m.stats}
                      description={m.description}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="text-xs opacity-70">Cantidad</div>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => {
                      const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
                      setQtyById((prev) => ({ ...prev, [m.id]: v }));
                    }}
                    className="w-20 rounded-lg border border-foreground/20 bg-transparent px-2 py-1 text-sm"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {m.title || "Sin título"}
                    </div>
                    <div className="text-xs opacity-70">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-1.5 text-xs hover:bg-foreground/10"
                      onClick={() => onLoad(m)}
                      type="button"
                    >
                      Cargar
                    </button>
                    <button
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/15 dark:text-red-400"
                      onClick={() => onDelete(m.id)}
                      type="button"
                    >
                      Borrar
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                    onClick={() =>
                      setQtyById((prev) => ({ ...prev, [m.id]: (prev[m.id] ?? 0) + 1 }))
                    }
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10 disabled:opacity-50"
                    disabled={qty <= 0}
                    onClick={() =>
                      setQtyById((prev) => ({
                        ...prev,
                        [m.id]: Math.max(0, (prev[m.id] ?? 0) - 1),
                      }))
                    }
                  >
                    -1
                  </button>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                  onClick={async () => {
                    try {
                      await ensureExport(m);
                      alert("Export guardado ✅");
                    } catch (e: any) {
                      alert(e?.message ?? "Error exportando");
                    }
                  }}
                >
                  Guardar PNG para PDF
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={openPrintPage}
            disabled={total === 0}
            className="rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10 disabled:opacity-50"
          >
            Imprimir (perfecto)
          </button>
        </div>
      )}
    </section>
  );
}