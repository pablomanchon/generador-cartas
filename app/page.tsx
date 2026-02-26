"use client";

import { CardEditor } from "./components/card/CardEditor";
import { CardPreview } from "./components/card/CardPreview";
import { ExportCardPngButton } from "./components/card/ExportCardPngButton";
import { Gallery } from "./components/card/Gallery";
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
    gallery,
    saveToGallery,
    loadFromGallery,
    deleteFromGallery,
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

          <div className="flex flex-col gap-3">
            <div className="flex justify-center gap-2">
              <CardPreview
                title={title}
                imageUrl={imageUrl}
                stats={stats}
                description={description}
              />
            </div>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={saveToGallery}
                className="w-fit rounded-xl border border-black/20 bg-black/10 px-4 py-2 text-sm font-medium hover:bg-black/15 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15"
              >
                Guardar en galería
              </button>

              <ExportCardPngButton cardRef={cardRef} title={title} pixelRatio={2} />
            </div>
          </div>
        </div>

        <Gallery
          items={gallery}
          onLoad={loadFromGallery}
          onDelete={deleteFromGallery}
        />
      </div>
    </main>
  );
}