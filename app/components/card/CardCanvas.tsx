"use client";

import type { Stat } from "./types";

type Props = {
  title: string;
  imageUrl: string | null;
  stats: Stat[];
  description: string;
  modelId?: string;
};

export function CardCanvas({
  title,
  imageUrl,
  stats,
  description,
  modelId,
}: Props) {
  return (
    <div
      id="card-export"
      data-model-id={modelId ?? ""}
      className="relative isolate h-130 w-90 overflow-hidden rounded-2xl border-2 bg-black shadow-xl"
      style={{ borderColor: "rgba(255,255,255,0.70)" }}
    >
      {/* ✅ Imagen SIEMPRE al fondo */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="card"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          style={{ opacity: 0.95 }}
          crossOrigin="anonymous"
          onLoad={(e) => {
            (e.currentTarget as HTMLImageElement).setAttribute("data-img-ready", "1");
          }}
        />
      ) : (
        <div className="absolute inset-0 z-0 grid place-items-center text-sm text-white/70">
          Subí una imagen
        </div>
      )}

      {/* ✅ Gradientes arriba de la imagen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
        }}
      />

      {/* ✅ Stats TL/TR arriba */}
      <div className="absolute inset-x-0 top-0 z-20 h-20">
        {stats
          .filter((s) => s.enabled && (s.corner === "TL" || s.corner === "TR"))
          .map((s) => (
            <div
              key={s.id}
              data-pill="1"
              className={`absolute ${
                s.corner === "TL" ? "top-3 left-3" : "top-3 right-3"
              } rounded-2xl border-2 border-black px-3 py-2 backdrop-blur`}
              style={{
                backgroundColor: `${s.bgColor}CC`,
                color: s.textColor,
                boxShadow:
                  "inset 0 0 0 9999px rgba(0,0,0,0.12), inset 0 2px 10px rgba(0,0,0,0.55)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ opacity: 0.9 }}>
                  {s.label}
                </span>
                <span className="text-base font-semibold">{s.value}</span>
              </div>
            </div>
          ))}
      </div>

      {/* ✅ Título */}
      <div className="absolute left-3 right-3 top-4 z-20">
        <div
          data-pill="1"
          className="mx-auto w-fit max-w-full rounded-2xl px-4 py-2 text-white backdrop-blur"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div className="max-w-[320px] truncate text-center text-sm font-semibold">
            {title || "Sin título"}
          </div>
        </div>
      </div>

      {/* ✅ Abajo: BL/BR + descripción */}
      <div className="absolute inset-x-0 bottom-3 z-20 px-3">
        <div className="flex flex-col items-center gap-2">
          <div className="flex w-full justify-between">
            {stats
              .filter((s) => s.enabled && (s.corner === "BL" || s.corner === "BR"))
              .map((s) => (
                <div
                  key={s.id}
                  data-pill="1"
                  className="rounded-2xl border-2 border-black px-3 py-2 backdrop-blur"
                  style={{
                    backgroundColor: `${s.bgColor}CC`,
                    color: s.textColor,
                    boxShadow:
                      "inset 0 0 0 9999px rgba(0,0,0,0.12), inset 0 2px 10px rgba(0,0,0,0.55)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ opacity: 0.9 }}>
                      {s.label}
                    </span>
                    <span className="text-base font-semibold">{s.value}</span>
                  </div>
                </div>
              ))}
          </div>

          <div
            data-pill="1"
            className="w-full rounded-2xl border-2 border-black px-4 py-2 text-white backdrop-blur"
            style={{
              backgroundColor: "rgba(0,0,0,0.55)",
              boxShadow:
                "inset 0 0 0 9999px rgba(0,0,0,0.12), inset 0 2px 10px rgba(0,0,0,0.55)",
            }}
          >
            <div className="text-center text-sm font-semibold whitespace-pre-wrap leading-snug">
              {description || "Sin descripción"}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}