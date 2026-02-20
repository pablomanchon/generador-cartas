"use client";

import type { Stat } from "./types";
import { StatEditorCard } from "./StatEditorCard";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  onPickImage: (file?: File | null) => void;
  stats: Stat[];
  usedCorners: Set<string>;
  updateStat: (id: string, patch: Partial<Stat>) => void;
};

export function CardEditor({
  title,
  setTitle,
  onPickImage,
  stats,
  usedCorners,
  updateStat,
}: Props) {
  return (
    <section className="rounded-2xl border border-foreground/15 bg-foreground/5 p-4">
      <h2 className="mb-3 text-lg font-semibold">Editor</h2>

      <label className="mb-3 block">
        <span className="mb-1 block text-sm opacity-80">Título</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-foreground/20 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm opacity-80">Imagen</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPickImage(e.target.files?.[0])}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-foreground/20 file:bg-background file:px-3 file:py-1.5 file:text-sm hover:file:bg-foreground/10"
        />
      </label>

      <div className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Stats</h3>
          <span className="text-xs opacity-70">Usadas: {Array.from(usedCorners).join(", ")}</span>
        </div>

        <div className="flex flex-col gap-3">
          {stats.map((s) => (
            <StatEditorCard key={s.id} stat={s} onChange={updateStat} />
          ))}
        </div>
      </div>
    </section>
  );
}