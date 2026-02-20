"use client";

import type { Stat } from "./types";

type Props = {
  title: string;
  imageUrl: string | null;
  stats: Stat[];
  cardRef: React.RefObject<HTMLDivElement | null>;
  description: string;
};

export function CardPreview({ title, imageUrl, stats, cardRef, description }: Props) {
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
                  className={`absolute ${s.corner === "TL" ? "top-3 left-3" : "top-3 right-3"
                    } rounded-2xl border-2 border-black px-3 py-2 shadow-inner shadow-black backdrop-blur`}
                  style={{ backgroundColor: `${s.bgColor}CC`, color: s.textColor }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium opacity-90">{s.label}</span>
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
          <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-3">

              {/* STATS */}
              <div className="flex w-full justify-between">
                {stats
                  .filter((s) => s.enabled && (s.corner === "BL" || s.corner === "BR"))
                  .map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border-2 border-black px-3 py-2 shadow-inner shadow-black backdrop-blur"
                      style={{
                        backgroundColor: `${s.bgColor}CC`,
                        color: s.textColor,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium opacity-90">
                          {s.label}
                        </span>
                        <span className="text-base font-semibold">
                          {s.value}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* DESCRIPCIÓN */}
              <div className="w-full rounded-2xl bg-black/55 px-4 py-2 text-white backdrop-blur border-2 border-black shadow-inner shadow-black">
                <div className="text-center text-sm font-semibold wrap-break-word">
                  {description || "Sin descripción"}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}