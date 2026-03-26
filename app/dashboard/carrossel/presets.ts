// ============================================
// PRESETS — Configurações visuais do Carousel Maker
// ============================================

// ── Types ──
export interface StylePreset {
  id: string;
  name: string;
  desc: string;
  headlineSize: number;
  headlineWeight: number;
  headlineAlign: "center" | "left";
  headlineTransform: "uppercase" | "none";
  bodySize: number;
  bodyAlign: "center" | "left";
  position: "center" | "bottom" | "bottom-bar";
  letterSpacing: string;
  lineHeight: number;
}

export interface PaletteColors {
  name: string;
  bg: string;
  accent: string;
  text: string;
  secondary: string;
}

export interface FontOption {
  name: string;
  family: string;
  google: string;
}

export interface MaskPreset {
  id: string;
  name: string;
  desc: string;
  build: (color: string, opacity: number) => string;
}

// ── Fontes ──
export const FONTS: FontOption[] = [
  { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", google: "Bebas+Neue" },
  { name: "Anton", family: "'Anton', sans-serif", google: "Anton" },
  { name: "Oswald", family: "'Oswald', sans-serif", google: "Oswald:wght@400;700" },
  { name: "Playfair", family: "'Playfair Display', serif", google: "Playfair+Display:wght@400;700;900" },
  { name: "Montserrat", family: "'Montserrat', sans-serif", google: "Montserrat:wght@400;700;900" },
  { name: "Poppins", family: "'Poppins', sans-serif", google: "Poppins:wght@400;600;700;900" },
  { name: "Archivo Black", family: "'Archivo Black', sans-serif", google: "Archivo+Black" },
  { name: "DM Serif", family: "'DM Serif Display', serif", google: "DM+Serif+Display" },
];

export function getGoogleFontsUrl(): string {
  const families = FONTS.map((f) => `family=${f.google}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// ── Paletas ──
export const PALETTES: PaletteColors[] = [
  { name: "Escuro", bg: "#0a0a0a", accent: "#e11d48", text: "#ffffff", secondary: "#991b1b" },
  { name: "Terroso", bg: "#0a0a0a", accent: "#f4a261", text: "#ffffff", secondary: "#e76f51" },
  { name: "Neon", bg: "#0C1A14", accent: "#03FF94", text: "#ffffff", secondary: "#59D4D1" },
  { name: "Laranja", bg: "#0a0a0a", accent: "#f97316", text: "#ffffff", secondary: "#fb923c" },
  { name: "Azul", bg: "#0a1628", accent: "#3b82f6", text: "#ffffff", secondary: "#60a5fa" },
  { name: "Claro", bg: "#f5f0eb", accent: "#1a1a1a", text: "#111111", secondary: "#666666" },
];

// ── Gradientes fallback (sem imagem) ──
export const GRADIENTS: ((p: PaletteColors) => string)[] = [
  (p) => `linear-gradient(135deg, ${p.bg} 0%, ${p.secondary}33 50%, ${p.bg} 100%)`,
  (p) => `linear-gradient(180deg, ${p.secondary}22 0%, ${p.bg} 100%)`,
  (p) => `radial-gradient(circle at 30% 40%, ${p.secondary}28 0%, ${p.bg} 70%)`,
  (p) => `linear-gradient(160deg, ${p.bg} 0%, ${p.secondary}30 40%, ${p.bg} 80%)`,
  (p) => `radial-gradient(ellipse at 70% 20%, ${p.secondary}25 0%, ${p.bg} 60%)`,
];

// ── Máscaras ──
// Cada máscara recebe a cor hex e opacidade (0-1) e retorna CSS gradient
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

export const MASKS: MaskPreset[] = [
  {
    id: "solid",
    name: "Sólida",
    desc: "Cor uniforme sobre a foto",
    build: (color, opacity) => `rgba(${hexToRgb(color)},${opacity})`,
  },
  {
    id: "gradient-bottom",
    name: "Gradiente ↑",
    desc: "Escurece de baixo pra cima",
    build: (color, opacity) =>
      `linear-gradient(to top, rgba(${hexToRgb(color)},${opacity}) 0%, rgba(${hexToRgb(color)},${opacity * 0.3}) 50%, transparent 100%)`,
  },
  {
    id: "gradient-top",
    name: "Gradiente ↓",
    desc: "Escurece de cima pra baixo",
    build: (color, opacity) =>
      `linear-gradient(to bottom, rgba(${hexToRgb(color)},${opacity}) 0%, rgba(${hexToRgb(color)},${opacity * 0.3}) 50%, transparent 100%)`,
  },
  {
    id: "vignette",
    name: "Vinheta",
    desc: "Escurece bordas, centro limpo",
    build: (color, opacity) =>
      `radial-gradient(ellipse at center, transparent 20%, rgba(${hexToRgb(color)},${opacity}) 100%)`,
  },
  {
    id: "cinema",
    name: "Cinema",
    desc: "Barras em cima e embaixo",
    build: (color, opacity) =>
      `linear-gradient(180deg, rgba(${hexToRgb(color)},${opacity}) 0%, transparent 30%, transparent 70%, rgba(${hexToRgb(color)},${opacity}) 100%)`,
  },
  {
    id: "none",
    name: "Sem máscara",
    desc: "Foto sem sobreposição",
    build: () => "transparent",
  },
];

// ── Estilos ──
export const STYLES: StylePreset[] = [
  {
    id: "impacto", name: "Impacto", desc: "Centralizado, uppercase, bold",
    headlineSize: 64, headlineWeight: 900, headlineAlign: "center", headlineTransform: "uppercase",
    bodySize: 22, bodyAlign: "center", position: "center", letterSpacing: "0.04em", lineHeight: 1.05,
  },
  {
    id: "editorial", name: "Editorial", desc: "Esquerda, storytelling, linha accent",
    headlineSize: 56, headlineWeight: 700, headlineAlign: "left", headlineTransform: "none",
    bodySize: 20, bodyAlign: "left", position: "bottom", letterSpacing: "0.01em", lineHeight: 1.15,
  },
  {
    id: "moderno", name: "Moderno", desc: "Barra colorida accent, sem overlay",
    headlineSize: 52, headlineWeight: 800, headlineAlign: "left", headlineTransform: "uppercase",
    bodySize: 19, bodyAlign: "left", position: "bottom-bar", letterSpacing: "0.03em", lineHeight: 1.1,
  },
];
