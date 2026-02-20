export type Corner = "TL" | "TR" | "BL" | "BR";

export type Stat = {
  id: string;
  label: string;
  value: string;
  corner: Corner;
  bgColor: string;
  textColor: string;
  enabled: boolean; // ✅ nuevo
};

export const cornerClass: Record<Corner, string> = {
  TL: "top-3 left-3",
  TR: "top-3 right-3",

  // ⬇️ los de abajo quedan “pegados” a un borde inferior, pero con margen
  // para que nunca se pisen con el título ni queden demasiado abajo.
  BL: "bottom-3 left-3",
  BR: "bottom-3 right-3",
};