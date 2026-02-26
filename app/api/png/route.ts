import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  html: string;
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  transparent?: boolean;
};

function wrapHtml(inner: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
      html, body { margin: 0; padding: 0; background: transparent; }

      /* ✅ Tus tamaños custom */
      .h-130 { height: 32.5rem; }
      .w-90  { width: 22.5rem; }

      body { display: grid; place-items: center; min-height: 100vh; }
    </style>
  </head>
  <body>${inner}</body>
</html>`;
}

async function launchBrowser() {
  // En Vercel: puppeteer-core + chromium-min
  if (process.env.VERCEL) {
    const puppeteer = (await import("puppeteer-core")).default;
    const chromium = (await import("@sparticuz/chromium")).default;

    const brotliPath = `${process.cwd()}/.vercel/output/static/chromium-brotli`;
    const executablePath = await chromium.executablePath(brotliPath);

    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  }

  // En local: puppeteer completo (más simple)
  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const html = body.html;
    if (!html || typeof html !== "string") {
      return NextResponse.json({ error: "Falta 'html' (string)" }, { status: 400 });
    }

    const width = Number(body.width ?? 1000);
    const height = Number(body.height ?? 1600);
    const deviceScaleFactor = Number(body.deviceScaleFactor ?? 2);
    const transparent = Boolean(body.transparent ?? false);

    const browser = await launchBrowser();

    try {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor });

      // 👇 OJO: networkidle0 a veces cuelga con tailwind CDN
      await page.setContent(wrapHtml(html), {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });

      // esperar un cachito a que tailwind CDN aplique estilos
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));

      // ✅ esperar fuentes
      await page.evaluate(async () => {
        // @ts-ignore
        if (document.fonts?.ready) {
          // @ts-ignore
          await document.fonts.ready;
        }
      });

      // ✅ esperar imágenes dentro de #card-export
      await page.waitForFunction(() => {
        const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("#card-export img"));
        if (imgs.length === 0) return true;
        return imgs.every((img) => img.complete && img.naturalWidth > 0);
      }, { timeout: 30_000 });

      const el = await page.$("#card-export");
      if (!el) {
        return NextResponse.json(
          { error: "No se encontró #card-export en el HTML enviado" },
          { status: 400 }
        );
      }

      const png = await el.screenshot({
        type: "png",
        omitBackground: transparent,
      });

      return new NextResponse(Buffer.from(png), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      });
    } finally {
      await browser.close();
    }
  } catch (e: any) {
    // 👇 Esto te muestra el error REAL en el cliente
    return NextResponse.json(
      {
        error: "Error en /api/png",
        message: e?.message ?? String(e),
        stack: e?.stack ?? null,
        vercel: Boolean(process.env.VERCEL),
      },
      { status: 500 }
    );
  }
}