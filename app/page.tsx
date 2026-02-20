"use client";

import { CardEditor } from "./components/card/CardEditor";
import { CardPreview } from "./components/card/CardPreview";
import { useCardEditor } from "./hooks/useCardEditor";


export default function Page() {
  const {
    title,
    setTitle,
    imageUrl,
    onPickImage,
    stats,
    updateStat,
    usedCorners,
    cardRef,
  } = useCardEditor();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Creador de Cartas</h1>
            <p className="text-sm opacity-80">
              Cargá una imagen y poné estadísticas en cualquiera de las 4 esquinas.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <CardEditor
            title={title}
            setTitle={setTitle}
            onPickImage={onPickImage}
            stats={stats}
            usedCorners={usedCorners}
            updateStat={updateStat}
          />

          <CardPreview title={title} imageUrl={imageUrl} stats={stats} cardRef={cardRef} />
        </div>
      </div>
    </main>
  );
}