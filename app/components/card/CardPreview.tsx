"use client";

import type { Stat } from "./types";

type Props = {
  title: string;
  imageUrl: string | null;
  stats: Stat[];
  cardRef: React.RefObject<HTMLDivElement | null>;
};

export function CardPreview({ title, imageUrl, stats, cardRef }: Props) {
  return (
    <section className="rounded-2xl border border-foreground/15 bg-foreground/5 p-4">
      <h2 className="mb-3 text-lg font-semibold">Preview</h2>

      <div className="flex flex-col items-start gap-3">
        {/* CARTA */}
        <div
          ref={cardRef}
          className="relative h-130 w-90 overflow-hidden rounded-2xl border-2 border-foreground/70 bg-black shadow-xl"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="card"
              className="h-full w-full object-cover opacity-95"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-white/70">
              Subí una imagen
            </div>
          )}

          {/* Gradientes para legibilidad */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/35 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/35 to-transparent" />

          {/* Zona superior: stats TL/TR (solo enabled) */}
          <div className="absolute inset-x-0 top-0 h-20">
            {stats
              .filter((s) => s.enabled && (s.corner === "TL" || s.corner === "TR"))
              .map((s) => (
                <div
                  key={s.id}
                  className={`absolute ${
                    s.corner === "TL" ? "top-3 left-3" : "top-3 right-3"
                  } rounded-2xl border-2 border-black px-3 py-2 shadow-inner shadow-black backdrop-blur`}
                  style={{ backgroundColor: `${s.bgColor}CC`, color: s.textColor }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-medium opacity-90">{s.label}</span>
                    <span className="text-base font-semibold">{s.value}</span>
                  </div>
                </div>
              ))}
          </div>

          {/* ✅ Título centrado debajo de los stats de arriba */}
          <div className="absolute left-3 right-3 top-4">
            <div className="mx-auto w-fit max-w-full rounded-2xl bg-black/55 px-4 py-2 text-white backdrop-blur">
              <div className="max-w-[320px] truncate text-center text-sm font-semibold">
                {title || "Sin título"}
              </div>
            </div>
          </div>

          {/* Zona inferior: stats BL/BR (solo enabled) */}
          <div className="absolute inset-x-0 bottom-0 h-24">
            {stats
              .filter((s) => s.enabled && (s.corner === "BL" || s.corner === "BR"))
              .map((s) => (
                <div
                  key={s.id}
                  className={`absolute ${
                    s.corner === "BL" ? "bottom-3 left-3" : "bottom-3 right-3"
                  } rounded-2xl border-2 border-black px-3 py-2 shadow-inner shadow-black backdrop-blur`}
                  style={{ backgroundColor: `${s.bgColor}CC`, color: s.textColor }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-medium opacity-90">{s.label}</span>
                    <span className="text-base font-semibold">{s.value}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* DESCRIPCIÓN DEBAJO */}
        <div className="w-90 rounded-2xl border border-foreground/15 bg-foreground/5 p-3">
          <p className="text-sm leading-relaxed opacity-90">
            Esta es la descripción de la carta. Podés poner lore, habilidad, etc.
          </p>
        </div>
      </div>
    </section>
  );
}