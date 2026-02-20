"use client";

import type { Corner, Stat } from "./types";

type Props = {
  stat: Stat;
  onChange: (id: string, patch: Partial<Stat>) => void;
};

export function StatEditorCard({ stat: s, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-foreground/15 bg-background p-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.enabled}
            onChange={(e) => onChange(s.id, { enabled: e.target.checked })}
            className="h-4 w-4"
          />
          Mostrar este stat
        </label>
        <label className="block">
          <span className="mb-1 block text-xs opacity-80">Label</span>
          <input
            value={s.label}
            onChange={(e) => onChange(s.id, { label: e.target.value })}
            className="w-full rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs opacity-80">Valor</span>
          <input
            value={s.value}
            onChange={(e) => onChange(s.id, { value: e.target.value })}
            className="w-full rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>

        <label className="col-span-2 block">
          <span className="mb-1 block text-xs opacity-80">Esquina</span>
          <select
            value={s.corner}
            onChange={(e) => onChange(s.id, { corner: e.target.value as Corner })}
            className="w-full rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          >
            <option value="TL">Arriba Izq (TL)</option>
            <option value="TR">Arriba Der (TR)</option>
            <option value="BL">Abajo Izq (BL)</option>
            <option value="BR">Abajo Der (BR)</option>
          </select>
        </label>

        <div className="col-span-2 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs opacity-80">Color fondo</span>
            <input
              type="color"
              value={s.bgColor}
              onChange={(e) => onChange(s.id, { bgColor: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-lg border border-foreground/20"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs opacity-80">Color texto</span>
            <input
              type="color"
              value={s.textColor}
              onChange={(e) => onChange(s.id, { textColor: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-lg border border-foreground/20"
            />
          </label>
        </div>
      </div>
    </div>
  );
}