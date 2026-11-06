export type Tema = "light" | "dark";
export type Idioma = "es" | "en";

/** Categoría reutilizable: tipo de tienda o tipo de producto. */
export interface Categoria {
  id: string;
  nombre: string;
  color: string;
  icono: string;
  /** Solo aplica a categorías de producto: si cobran ITBMS (7%). */
  itbms: boolean;
  creada: string;
}

export interface Tienda {
  id: string;
  nombre: string;
  /** id de Categoria (tipo de tienda). */
  tipoId: string;
  lugar: string;
  color: string;
  icono: string;
  creada: string;
}

export interface Producto {
  id: string;
  nombre: string;
  /** null = precio aún desconocido (se puede colocar después). */
  precio: number | null;
  tiendaId: string;
  /** id de Categoria (tipo de producto). */
  tipoId: string;
  color: string;
  icono: string;
  creada: string;
  actualizada: string;
}

/** Registro del historial de precios: solo se crea si se indicó subida/bajada. */
export interface MovimientoPrecio {
  id: string;
  productoId: string;
  precio: number;
  cambio: "creado" | "subida" | "bajada" | "correccion";
  fecha: string;
}

export interface ItemLista {
  productoId: string;
  marcado: boolean;
}

export interface ListaCompras {
  id: string;
  nombre: string;
  tiendaId: string;
  items: ItemLista[];
  creada: string;
  actualizada: string;
}

export interface Datos {
  tiposTienda: Categoria[];
  tiposProducto: Categoria[];
  tiendas: Tienda[];
  productos: Producto[];
  precios: MovimientoPrecio[];
  listas: ListaCompras[];
}

export interface Config {
  color: string;
  emojis: "color" | "mono" | "ninguno";
  confirmarSalida: boolean;
}

export interface PresetColor {
  id: string;
  nombre: string;
  light: string;
  dark: string;
}

export const COLOR_PRESETS: PresetColor[] = [
  { id: "marino", nombre: "Azul marino", light: "#123C63", dark: "#7ABAF0" },
  { id: "esmeralda", nombre: "Esmeralda", light: "#0E9B62", dark: "#34D399" },
  { id: "azul", nombre: "Azul", light: "#2563EB", dark: "#60A5FA" },
  { id: "morado", nombre: "Morado", light: "#7C3AED", dark: "#A78BFA" },
  { id: "rosa", nombre: "Rosa", light: "#DB2777", dark: "#F472B6" },
  { id: "naranja", nombre: "Naranja", light: "#EA580C", dark: "#FB923C" },
  { id: "teal", nombre: "Turquesa", light: "#0D9488", dark: "#2DD4BF" },
  { id: "ambar", nombre: "Ámbar", light: "#B45309", dark: "#FBBF24" },
  { id: "gris", nombre: "Grafito", light: "#475569", dark: "#94A3B8" },
];

export const COLORES_MARCA = [
  "#12A365",
  "#123C63",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#0D9488",
  "#CA8A04",
  "#DC2626",
  "#4B5563",
  "#0891B2",
  "#65A30D",
];

/** Iconos de la lista desplegable para tiendas, productos y categorías. */
export const ICONOS_MARCA = [
  "🛒",
  "🏪",
  "👗",
  "🍽️",
  "💊",
  "📚",
  "🛠️",
  "🍞",
  "🍎",
  "🧴",
  "🎬",
  "🏫",
  "🖥️",
  "🧸",
  "🚗",
  "🐶",
  "🌱",
  "⚽",
  "🎨",
  "⚙️",
  "📦",
  "🧺",
  "🍳",
  "💰",
];

export const ITBMS_PORCENTAJE = 0.07;

/** Formatea un precio en dólares con 2 decimales: 1.35 → "$1.35". */
export function formatoPrecio(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `$${n.toFixed(2)}`;
}

/** Interpreta un valor de precio escrito por el usuario. Vacío → null. */
export function parsearPrecio(texto: string): number | null {
  const limpio = texto.trim().replace(/\s/g, "").replace(",", ".");
  if (!limpio) return null;
  const n = Number(limpio);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}
