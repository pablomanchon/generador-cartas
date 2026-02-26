const KEY = "cc_exports_v1";

export type ExportCache = Record<string, string>; // modelId -> dataURL (png o jpeg)

function safeParse(raw: string | null): ExportCache {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getExportCache(): ExportCache {
  return safeParse(localStorage.getItem(KEY));
}

export function getExportDataUrl(modelId: string): string | null {
  const cache = getExportCache();
  return cache[modelId] ?? null;
}

export function setExportDataUrl(modelId: string, dataUrl: string) {
  const cache = getExportCache();
  cache[modelId] = dataUrl;
  localStorage.setItem(KEY, JSON.stringify(cache));
}

export function deleteExportDataUrl(modelId: string) {
  const cache = getExportCache();
  delete cache[modelId];
  localStorage.setItem(KEY, JSON.stringify(cache));
}