"use client";

import { useState } from "react";
import { setExportBlob } from "../storage/exportCache";

type Props = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
  modelId: string;
};

function safeFileName(name: string) {
  return (name ?? "carta")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function fetchAsDataUrl(src: string): Promise<string | null> {
  try {
    if (src.startsWith("data:")) return src;
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

async function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportCardPuppeteerButton({ cardRef, fileName, modelId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const el = cardRef.current;
    if (!el) return alert("cardRef.current está null");

    setLoading(true);
    try {
      let html = el.outerHTML;

      const imgs = Array.from(el.querySelectorAll("img"));
      for (const img of imgs) {
        const src = img.getAttribute("src") || "";
        if (!src) continue;

        if (src.startsWith("blob:") || src.startsWith("http") || src.startsWith("https:")) {
          const dataUrl = await fetchAsDataUrl(src);
          if (dataUrl) html = html.replaceAll(src, dataUrl);
        }
      }

      const res = await fetch("/api/png", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          width: 1000,
          height: 1600,
          deviceScaleFactor: 2,
          transparent: false,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();

      // ✅ guardar en IndexedDB como Blob
      await setExportBlob(modelId, blob);

      // ✅ opcional: descargar también
      await downloadBlob(blob, `${safeFileName(fileName ?? "carta")}.png`);
    } catch (e) {
      console.error(e);
      alert("Error exportando: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="w-fit rounded-xl border border-black/20 bg-black/10 px-4 py-2 text-sm font-medium hover:bg-black/15 disabled:opacity-60 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15"
    >
      {loading ? "Exportando..." : "Exportar PNG"}
    </button>
  );
}