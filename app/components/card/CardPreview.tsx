"use client";

import type { Stat } from "./types";

type Props = {
  title: string;
  imageUrl: string | null;
  stats: Stat[];
  cardRef: React.RefObject<HTMLDivElement | null>;
  description: string;
};

export function CardPreview({
  title,
  imageUrl,
  stats,
  cardRef,
  description,
}: Props) {
  return (
    <section
      className="rounded-2xl border p-4"
      style={{
        borderColor: "rgba(0,0,0,0.15)",
        backgroundColor: "rgba(0,0,0,0.05)",
      }}
    >
      <h2 className="mb-3 text-lg font-semibold">Preview</h2>

      <div className="flex flex-col items-start gap-3">
        {/* CARTA */}
        <div
          id="card-export"
          ref={cardRef}
          className="relative h-130 w-90 overflow-hidden rounded-2xl border-2 bg-black"
          style={{
            borderColor: "rgba(255,255,255,0.70)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="card"
              className="h-full w-full object-cover"
              style={{ opacity: 0.95 }}
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center text-sm"
              style={{ color: "rgba(255,255,255,0.70)" }}
            >
              Subí una imagen
            </div>
          )}

          {/* Gradientes para legibilidad */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
            }}
          />

          {/* Zona superior: stats TL/TR (solo enabled) */}
          <div className="absolute inset-x-0 top-0 h-20">
            {stats
              .filter((s) => s.enabled && (s.corner === "TL" || s.corner === "TR"))
              .map((s) => (
                <div
                  key={s.id}
                  data-pill="1"
                  className={`absolute ${s.corner === "TL" ? "top-3 left-3" : "top-3 right-3"
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

          {/* Título centrado */}
          <div className="absolute left-3 right-3 top-4">
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

          {/* Zona inferior: stats + descripción */}
          <div className="absolute inset-x-0 bottom-3 px-3">
            <div className="flex flex-col items-center gap-2">
              {/* STATS BL/BR */}
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

              {/* DESCRIPCIÓN */}
              <div
                data-pill="1"
                className="w-full rounded-2xl border-2 border-black px-4 py-2 text-white backdrop-blur"
                style={{
                  backgroundColor: "rgba(0,0,0,0.55)",
                  boxShadow:
                    "inset 0 0 0 9999px rgba(0,0,0,0.12), inset 0 2px 10px rgba(0,0,0,0.55)",
                }}
              >
                <div className="desc-text text-center text-sm font-semibold whitespace-pre-wrap wrap-break-word leading-snug">
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