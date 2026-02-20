"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Stat } from "../components/card/types";

const DEFAULT_STATS: Stat[] = [
  { id: "1", label: "ATK", value: "80", corner: "TL", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
  { id: "2", label: "DEF", value: "60", corner: "TR", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
  { id: "3", label: "SPD", value: "40", corner: "BL", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
  { id: "4", label: "HP", value: "100", corner: "BR", bgColor: "#000000", textColor: "#ffffff", description: "", enabled: true },
];

export function useCardEditor() {
  const [title, setTitle] = useState("Mi Carta");
  const [imageUrl, setImageUrl] = useState<string | null>(null); // ahora va a ser dataURL
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [description, setDescription] = useState<string>("");

  const cardRef = useRef<HTMLDivElement | null>(null);

  const usedCorners = useMemo(() => new Set(stats.map((s) => s.corner)), [stats]);

  const updateStat = useCallback((id: string, patch: Partial<Stat>) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const onPickImage = useCallback((file?: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setImageUrl(result);
    };
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      setImageUrl(null);
    };
    reader.readAsDataURL(file); // ✅ data:image/...;base64,...
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
  };
}