import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  html: string; // debe contener #card-export
  width?: number; // viewport
  height?: number; // viewport
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
      .h-130 { height: 32.5rem; } /* 130 * 0.25rem */
      .w-90  { width: 22.5rem; }  /* 90  * 0.25rem */

      body { display: grid; place-items: center; min-height: 100vh; }
    </style>
  </head>

  <body>
    ${inner}
  </body>
</html>`;
}

export async function POST(req: Request) {
  let body: Body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body debe ser JSON" }, { status: 400 });
  }

  const html = body.html;
  if (!html || typeof html !== "string") {
    return NextResponse.json({ error: "Falta 'html' (string)" }, { status: 400 });
  }

  const width = Number(body.width ?? 1000);
  const height = Number(body.height ?? 1600);
  const deviceScaleFactor = Number(body.deviceScaleFactor ?? 2);
  const transparent = Boolean(body.transparent ?? false);

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(), // 👈 clave en Vercel
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor });

    await page.setContent(wrapHtml(html), {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });

    // ✅ esperar fuentes
    await page.evaluate(async () => {
      // @ts-ignore
      if (document.fonts?.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }
    });

    // ✅ esperar imágenes reales dentro de #card-export
    await page.waitForFunction(() => {
      const imgs = Array.from(
        document.querySelectorAll<HTMLImageElement>("#card-export img")
      );
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
}