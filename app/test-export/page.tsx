"use client";

import { useState } from "react";

export default function TestExportPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setImageUrl(null);

    const html = `
      <div id="card-export"
        class="relative h-130 w-90 overflow-hidden rounded-2xl border-2 bg-black shadow-xl text-white flex flex-col items-center justify-center"
        style="border-color: rgba(255,255,255,0.7);"
      >
        <div class="absolute inset-0 bg-linear-to-b from-black/40 to-black/80"></div>

        <div class="relative z-10 text-center px-6">
          <h1 class="text-xl font-bold mb-4">Carta de Prueba 🔥</h1>
          <p class="text-sm opacity-90">
            Esto es un test de Puppeteer + Tailwind.
          </p>
        </div>
      </div>
    `;

    try {
      const res = await fetch("/api/png", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          width: 750,
          height: 1050,
          deviceScaleFactor: 2,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      alert("Error generando imagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6 p-6">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
      >
        {loading ? "Generando..." : "Generar Imagen"}
      </button>

      {imageUrl && (
        <div className="flex flex-col items-center gap-4">
          <img
            src={imageUrl}
            alt="Resultado"
            className="border rounded-lg shadow-lg"
          />

          <a
            href={imageUrl}
            download="carta.png"
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition"
          >
            Descargar PNG
          </a>
        </div>
      )}
    </main>
  );
}