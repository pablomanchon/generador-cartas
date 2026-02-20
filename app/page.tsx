"use client";

import { CardEditor } from "./components/card/CardEditor";
import { CardPreview } from "./components/card/CardPreview";
import { ExportCardPngButton } from "./components/card/ExportCardPngButton";
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
    description,
    setDescription,
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
            description={description}
            setDescription={setDescription}
          />

          {/* Columna derecha */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <ExportCardPngButton
                cardRef={cardRef}
                title={title}
                pixelRatio={2}
              />
            </div>

            <CardPreview
              title={title}
              imageUrl={imageUrl}
              stats={stats}
              cardRef={cardRef}
              description={description}
            />
          </div>
        </div>
      </div>
    </main>
  );
}