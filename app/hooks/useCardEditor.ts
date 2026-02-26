"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CardModel, Stat } from "../components/card/types";
import { LS_KEY, safeParse } from "../components/card/utils";
import { dataUrlToBlob, deleteImage, getImage, putImage } from "../components/card/imageStore";

const DEFAULT_STATS: Stat[] = [
  { id: "1", label: "ATK", value: "80", corner: "TL", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
  { id: "2", label: "DEF", value: "60", corner: "TR", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
  { id: "3", label: "SPD", value: "40", corner: "BL", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
  { id: "4", label: "HP", value: "100", corner: "BR", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
];

export function useCardEditor() {
  const [title, setTitle] = useState("Mi Carta");
  const [imageUrl, setImageUrl] = useState<string | null>(null); // preview actual (dataURL u objectURL)
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [description, setDescription] = useState<string>("");
  const [gallery, setGallery] = useState<CardModel[]>([]);

  // Para liberar objectURLs al cambiar imagen cargada desde IDB
  const lastObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const saved = safeParse<CardModel[]>(localStorage.getItem(LS_KEY));
    if (saved && Array.isArray(saved)) setGallery(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(gallery));
  }, [gallery]);

  const saveToGallery = useCallback(async () => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    let imageKey: string | null = null;

    if (imageUrl && imageUrl.startsWith("data:")) {
      imageKey = `img_${id}`;
      const blob = dataUrlToBlob(imageUrl);
      await putImage(imageKey, blob);
    } else {
      // Si no es dataURL, no lo persistimos (podés mejorarlo luego)
      imageKey = null;
    }

    const model: CardModel = {
      id,
      title,
      imageKey,
      description,
      stats,
      createdAt: Date.now(),
    };

    setGallery((prev) => [model, ...prev]);
  }, [title, imageUrl, description, stats]);

  const loadFromGallery = useCallback(async (m: CardModel) => {
    setTitle(m.title);
    setDescription(m.description);
    setStats(m.stats);

    // limpiar objectURL anterior (si existía)
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }

    if (!m.imageKey) {
      setImageUrl(null);
      return;
    }

    const blob = await getImage(m.imageKey);
    if (!blob) {
      setImageUrl(null);
      return;
    }

    const objUrl = URL.createObjectURL(blob);
    lastObjectUrlRef.current = objUrl;
    setImageUrl(objUrl);
  }, []);

  const deleteFromGallery = useCallback((id: string) => {
    const ok = confirm("¿Estás seguro de que quieres eliminar esta carta?");
    if (!ok) return;

    setGallery((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item?.imageKey) deleteImage(item.imageKey); // fire-and-forget
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const usedCorners = useMemo(() => new Set(stats.map((s) => s.corner)), [stats]);

  const updateStat = useCallback((id: string, patch: Partial<Stat>) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const onPickImage = useCallback((file?: File | null) => {
    if (!file) return;

    // si antes se cargó desde IDB (objectURL), liberalo
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setImageUrl(result);
    };
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      setImageUrl(null);
    };
    reader.readAsDataURL(file); // data:image/...;base64,...
  }, []);

  // cleanup general
  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
    };
  }, []);

  return {
    title,
    setTitle,
    imageUrl,
    onPickImage,
    stats,
    setStats,
    updateStat,
    usedCorners,
    cardRef,
    description,
    setDescription,
    gallery,
    saveToGallery,
    loadFromGallery,
    deleteFromGallery,
  };
}