"use client";

import { useEffect, useMemo, useState } from "react";
import type { CardModel } from "@/app/components/card/types";
import { CardCanvas } from "@/app/components/card/CardCanvas";
import { getImage } from "@/app/components/card/imageStore";

type PrintJob = {
  items: Array<{ id: string; qty: number }>;
};

function loadGalleryMeta(): CardModel[] {
  try {
    const raw = localStorage.getItem("cc_gallery_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function PrintPage() {
  const [job, setJob] = useState<PrintJob | null>(null);
  const [models, setModels] = useState<CardModel[]>([]);
  const [urlById, setUrlById] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("cc_print_job_v1");
      if (!raw) return;
      setJob(JSON.parse(raw));
    } catch { }
  }, []);

  useEffect(() => {
    setModels(loadGalleryMeta());
  }, []);

  useEffect(() => {
    let alive = true;
    const created: string[] = [];

    async function run() {
      if (!job) return;
      const next: Record<string, string> = {};

      for (const it of job.items) {
        const model = models.find((m) => m.id === it.id);
        if (!model?.imageKey) continue;

        const blob = await getImage(model.imageKey);
        if (!alive) return;
        if (!blob) continue;

        const url = URL.createObjectURL(blob);
        created.push(url);
        next[it.id] = url;
      }

      if (alive) setUrlById(next);
    }

    run();

    return () => {
      alive = false;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [job, models]);

  const expanded = useMemo(() => {
    if (!job) return [];
    const out: CardModel[] = [];
    for (const it of job.items) {
      const m = models.find((x) => x.id === it.id);
      if (!m) continue;
      for (let i = 0; i < it.qty; i++) out.push(m);
    }
    return out;
  }, [job, models]);

  useEffect(() => {
    if (!job) return;

    let cancelled = false;

    (async () => {
      // @ts-ignore
      if (document.fonts?.ready) await document.fonts.ready;
      await sleep(350);
      if (cancelled) return;
      window.print();
    })();

    return () => {
      cancelled = true;
    };
  }, [job, urlById]);

  if (!job) return <div className="p-6">No hay trabajo de impresión.</div>;

  return (
    <div className="min-h-screen bg-zinc-200 p-3 print:bg-white print:p-0">
      <div className="bg-white p-[8mm] mx-auto print:mx-0 w-220">
        <div className="grid grid-cols-3 auto-rows-[88mm] gap-[4mm] justify-items-center items-center">
          {expanded.map((m, idx) => (
            <div className="scale-65">
              <CardCanvas
                title={m.title}
                imageUrl={urlById[m.id] ?? null}
                stats={m.stats}
                description={m.description}
              />
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}