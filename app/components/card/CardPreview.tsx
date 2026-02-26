"use client";

import type { Stat } from "./types";
import { CardCanvas } from "./CardCanvas";

type Props = {
  title: string;
  imageUrl: string | null;
  stats: Stat[];
  description: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
};

export function CardPreview({ title, imageUrl, stats, description,cardRef }: Props) {
  return (
    <section
      className="rounded-2xl border p-4"
      style={{
        borderColor: "rgba(0,0,0,0.15)",
        backgroundColor: "rgba(0,0,0,0.05)",
      }}
    >
      <h2 className="mb-3 text-lg font-semibold text-center">Preview</h2>

        <CardCanvas
        cardRef={cardRef}
          title={title}
          imageUrl={imageUrl}
          stats={stats}
          description={description}
        />
    </section>
  );
}