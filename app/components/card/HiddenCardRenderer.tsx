"use client";

import React from "react";
import type { CardModel } from "./types";
import { CardCanvas } from "./CardCanvas";

export function HiddenCardRenderer({
  model,
  imageUrl,
  cardRef,
}: {
  model: CardModel;
  imageUrl: string | null; // ✅ dataURL para export
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        transform: "translateX(-5000px)",
        opacity: 0.001,
        pointerEvents: "none",
      }}
    >
      {/* ✅ SOLO acá usamos id="card-export" para el onclone del hook */}
      <div id="card-export" ref={cardRef}>
        <CardCanvas
          title={model.title}
          imageUrl={imageUrl}
          stats={model.stats}
          description={model.description}
        />
      </div>
    </div>
  );
}