const DB_NAME = "card-creator-db";
const DB_VERSION = 1;
const STORE_NAME = "exports";

type ExportRecord = {
  id: string;
  blob: Blob;
  updatedAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function getExportBlob(modelId: string): Promise<Blob | null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(modelId);

    request.onsuccess = () => {
      const result = request.result as ExportRecord | undefined;
      resolve(result?.blob ?? null);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getExportDataUrl(modelId: string): Promise<string | null> {
  const blob = await getExportBlob(modelId);
  if (!blob) return null;
  return await blobToDataURL(blob);
}

export async function setExportBlob(modelId: string, blob: Blob): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record: ExportRecord = {
      id: modelId,
      blob,
      updatedAt: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteExportDataUrl(modelId: string): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(modelId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearExportCache(): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}