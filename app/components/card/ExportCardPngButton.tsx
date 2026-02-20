"use client";

import React from "react";
import { useExportCardPng } from "@/app/hooks/useExportCardPng";

type Props = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  title?: string;
  className?: string;
  pixelRatio?: number;      // 2 por defecto
  backgroundColor?: string; // ej "#000000"
};

export function ExportCardPngButton({
  cardRef,
  title,
  className,
  pixelRatio = 2,
  backgroundColor,
}: Props) {
  const { exportPng, isExporting, error } = useExportCardPng(cardRef, title);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => exportPng({ pixelRatio, backgroundColor })}
        disabled={isExporting}
        className={
          className ??
          "w-fit rounded-xl border border-black/20 bg-black/10 px-4 py-2 text-sm font-medium hover:bg-black/15 disabled:opacity-60 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15"
        }
      >
        {isExporting ? "Exportando..." : "Descargar PNG"}
      </button>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}