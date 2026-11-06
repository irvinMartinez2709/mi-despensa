import type { Categoria, Config, Datos, ListaCompras, MovimientoPrecio, Producto, Tema, Tienda } from "../types";

const CLAVE_DATOS = "despensa.datos.v1";
const CLAVE_CONFIG = "despensa.config.v1";
const CLAVE_TEMA = "despensa.tema.v1";
const CLAVE_SEMILLA = "despensa.semilla.v1";
const VERSION_DATOS = 1;

export const CONFIG_DEFECTO: Config = {
  color: "marino",
  emojis: "color",
  confirmarSalida: true,
};

export function nuevoId(prefijo = "id"): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/* Datos de ejemplo (se cargan la primera vez)                         */
/* ------------------------------------------------------------------ */

export function datosEjemplo(): Datos {
  const cat = (
    id: string,
    nombre: string,
    icono: string,
    color: string,
    itbms = false
  ): Categoria => ({
    id,
    nombre,
    icono,
    color,
    itbms,
    creada: "2026-10-01T10:00:00.000Z",
  });

  const supermercado = cat("cat-ej-super", "Supermercado", "🛒", "#123C63");
  const legumbres = cat("cat-ej-legum", "Legumbería", "🍎", "#65A30D");
  const ropa = cat("cat-ej-ropa", "Ropa", "👗", "#DB2777");

  const despensa = cat("cat-ej-desp", "Despensa", "📦", "#12A365", true);
  const frescos = cat("cat-ej-fres", "Frescos", "🌱", "#0D9488", false);
  const lacteos = cat("cat-ej-lact", "Lácteos", "🥛", "#CA8A04", false);
  const camisas = cat("cat-ej-cam", "Camisas", "👗", "#DB2777", false);

  const tiendas: Tienda[] = [
    {
      id: "tie-ej-ahorro",
      nombre: "Supermercado El Ahorro",
      tipoId: supermercado.id,
      lugar: "Colonia Obarrio",
      color: "#123C63",
      icono: "🛒",
      creada: "2026-10-05T09:00:00.000Z",
    },
    {
      id: "tie-ej-carmen",
      nombre: "Legumbería Doña Carmen",
      tipoId: legumbres.id,
      lugar: "Mercado de Mariscos",
      color: "#65A30D",
      icono: "🍎",
      creada: "2026-10-08T09:00:00.000Z",
    },
    {
      id: "tie-ej-modas",
      nombre: "Modas Carolina",
      tipoId: ropa.id,
      lugar: "",
      color: "#DB2777",
      icono: "👗",
      creada: "2026-10-10T09:00:00.000Z",
    },
  ];

  const prod = (
    id: string,
    nombre: string,
    precio: number | null,
    tiendaId: string,
    tipoId: string,
    icono: string,
    color: string,
    creada: string
  ): Producto => ({
    id,
    nombre,
    precio,
    tiendaId,
    tipoId,
    icono,
    color,
    creada,
    actualizada: creada,
  });

  const productos: Producto[] = [
    prod("pro-ej-jamo", "Jamonilla", 1.35, tiendas[0].id, despensa.id, "📦", "#12A365", "2026-10-12T10:00:00.000Z"),
    prod("pro-ej-soda", "Soda 3L", 2.35, tiendas[0].id, despensa.id, "📦", "#12A365", "2026-10-12T10:05:00.000Z"),
    prod("pro-ej-arroz", "Arroz 1 lb", 0.65, tiendas[0].id, despensa.id, "📦", "#12A365", "2026-10-12T10:10:00.000Z"),
    prod("pro-ej-leche", "Leche entera 1L", 1.2, tiendas[0].id, lacteos.id, "🥛", "#CA8A04", "2026-10-12T10:15:00.000Z"),
    prod("pro-ej-platano", "Plátano (lb)", 0.35, tiendas[1].id, frescos.id, "🌱", "#0D9488", "2026-10-14T11:00:00.000Z"),
    prod("pro-ej-tomate", "Tomate (lb)", 0.8, tiendas[1].id, frescos.id, "🌱", "#0D9488", "2026-10-14T11:05:00.000Z"),
    prod("pro-ej-camisa", "Camisa básica", null, tiendas[2].id, camisas.id, "👗", "#DB2777", "2026-10-15T11:00:00.000Z"),
  ];

  const precios: MovimientoPrecio[] = [
    {
      id: "pre-ej-soda-1",
      productoId: "pro-ej-soda",
      precio: 2.15,
      cambio: "creado",
      fecha: "2026-10-12T10:05:00.000Z",
    },
    {
      id: "pre-ej-soda-2",
      productoId: "pro-ej-soda",
      precio: 2.35,
      cambio: "subida",
      fecha: "2026-10-25T16:30:00.000Z",
    },
    {
      id: "pre-ej-jamo-1",
      productoId: "pro-ej-jamo",
      precio: 1.35,
      cambio: "creado",
      fecha: "2026-10-12T10:00:00.000Z",
    },
    {
      id: "pre-ej-jamo-2",
      productoId: "pro-ej-jamo",
      precio: 1.15,
      cambio: "bajada",
      fecha: "2026-10-28T09:20:00.000Z",
    },
    {
      id: "pre-ej-jamo-3",
      productoId: "pro-ej-jamo",
      precio: 1.35,
      cambio: "subida",
      fecha: "2026-11-02T18:00:00.000Z",
    },
  ];

  const listas: ListaCompras[] = [
    {
      id: "lis-ej-semana",
      nombre: "Compra semanal",
      tiendaId: tiendas[0].id,
      items: [
        { productoId: "pro-ej-jamo", marcado: false },
        { productoId: "pro-ej-arroz", marcado: false },
        { productoId: "pro-ej-leche", marcado: false },
      ],
      creada: "2026-10-30T08:00:00.000Z",
      actualizada: "2026-10-30T08:00:00.000Z",
    },
  ];

  return {
    tiposTienda: [supermercado, legumbres, ropa],
    tiposProducto: [despensa, frescos, lacteos, camisas],
    tiendas,
    productos,
    precios,
    listas,
  };
}

export function datosVacios(): Datos {
  return { tiposTienda: [], tiposProducto: [], tiendas: [], productos: [], precios: [], listas: [] };
}

/* ------------------------------------------------------------------ */
/* Normalización (tolerante a datos viejos o importados)               */
/* ------------------------------------------------------------------ */

function idValido(v: unknown): string {
  return typeof v === "string" && v.length > 0 ? v : nuevoId("id");
}

function texto(v: unknown, defecto = ""): string {
  return typeof v === "string" ? v : defecto;
}

function normalizarCategoria(c: unknown): Categoria | null {
  if (!c || typeof c !== "object") return null;
  const x = c as Partial<Categoria>;
  const nombre = texto(x.nombre).trim();
  if (!nombre) return null;
  return {
    id: idValido(x.id),
    nombre,
    color: texto(x.color, "#12A365"),
    icono: texto(x.icono, "📦"),
    itbms: x.itbms === true,
    creada: texto(x.creada, new Date().toISOString()),
  };
}

function normalizarTienda(t: unknown): Tienda | null {
  if (!t || typeof t !== "object") return null;
  const x = t as Partial<Tienda>;
  const nombre = texto(x.nombre).trim();
  if (!nombre) return null;
  return {
    id: idValido(x.id),
    nombre,
    tipoId: texto(x.tipoId),
    lugar: texto(x.lugar),
    color: texto(x.color, "#123C63"),
    icono: texto(x.icono, "🛒"),
    creada: texto(x.creada, new Date().toISOString()),
  };
}

function normalizarProducto(p: unknown): Producto | null {
  if (!p || typeof p !== "object") return null;
  const x = p as Partial<Producto>;
  const nombre = texto(x.nombre).trim();
  if (!nombre) return null;
  const precio =
    typeof x.precio === "number" && Number.isFinite(x.precio) && x.precio >= 0
      ? Math.round(x.precio * 100) / 100
      : null;
  const creada = texto(x.creada, new Date().toISOString());
  return {
    id: idValido(x.id),
    nombre,
    precio,
    tiendaId: texto(x.tiendaId),
    tipoId: texto(x.tipoId),
    color: texto(x.color, "#12A365"),
    icono: texto(x.icono, "📦"),
    creada,
    actualizada: texto(x.actualizada, creada),
  };
}

function normalizarPrecio(m: unknown): MovimientoPrecio | null {
  if (!m || typeof m !== "object") return null;
  const x = m as Partial<MovimientoPrecio>;
  if (typeof x.productoId !== "string" || !x.productoId) return null;
  if (typeof x.precio !== "number" || !Number.isFinite(x.precio) || x.precio < 0) return null;
  const cambio =
    x.cambio === "subida" || x.cambio === "bajada" || x.cambio === "correccion"
      ? x.cambio
      : "creado";
  return {
    id: idValido(x.id),
    productoId: x.productoId,
    precio: Math.round(x.precio * 100) / 100,
    cambio,
    fecha: texto(x.fecha, new Date().toISOString()),
  };
}

function normalizarLista(l: unknown): ListaCompras | null {
  if (!l || typeof l !== "object") return null;
  const x = l as Partial<ListaCompras>;
  const nombre = texto(x.nombre).trim();
  if (!nombre) return null;
  const creada = texto(x.creada, new Date().toISOString());
  const items = Array.isArray(x.items)
    ? x.items
        .filter((i): i is { productoId: string; marcado: boolean } => !!i && typeof i === "object" && typeof (i as { productoId?: unknown }).productoId === "string")
        .map((i) => ({ productoId: i.productoId, marcado: i.marcado === true }))
    : [];
  return {
    id: idValido(x.id),
    nombre,
    tiendaId: texto(x.tiendaId),
    items,
    creada,
    actualizada: texto(x.actualizada, creada),
  };
}

export function normalizarDatos(bruto: unknown): Datos {
  const obj = (bruto || {}) as Partial<Datos>;

  const tiposTienda = Array.isArray(obj.tiposTienda)
    ? obj.tiposTienda.map(normalizarCategoria).filter((c): c is Categoria => c !== null)
    : [];
  const tiposProducto = Array.isArray(obj.tiposProducto)
    ? obj.tiposProducto.map(normalizarCategoria).filter((c): c is Categoria => c !== null)
    : [];
  const tiendas = Array.isArray(obj.tiendas)
    ? obj.tiendas.map(normalizarTienda).filter((t): t is Tienda => t !== null)
    : [];
  const tiendaIds = new Set(tiendas.map((t) => t.id));
  const productos = Array.isArray(obj.productos)
    ? obj.productos
        .map(normalizarProducto)
        .filter((p): p is Producto => p !== null && tiendaIds.has(p.tiendaId))
    : [];
  const productoIds = new Set(productos.map((p) => p.id));
  const precios = Array.isArray(obj.precios)
    ? obj.precios
        .map(normalizarPrecio)
        .filter((m): m is MovimientoPrecio => m !== null && productoIds.has(m.productoId))
    : [];
  const listas = Array.isArray(obj.listas)
    ? obj.listas
        .map(normalizarLista)
        .filter((l): l is ListaCompras => l !== null && tiendaIds.has(l.tiendaId))
        .map((l) => ({
          ...l,
          items: l.items.filter((i) => productoIds.has(i.productoId)),
        }))
    : [];

  return { tiposTienda, tiposProducto, tiendas, productos, precios, listas };
}

/* ------------------------------------------------------------------ */
/* Lectura / escritura                                                  */
/* ------------------------------------------------------------------ */

export function leerDatos(): Datos {
  try {
    const raw = localStorage.getItem(CLAVE_DATOS);
    if (!raw) {
      const base = datosEjemplo();
      guardarDatos(base);
      localStorage.setItem(CLAVE_SEMILLA, "1");
      return base;
    }
    const parsed = JSON.parse(raw);
    const bruto = parsed && typeof parsed === "object" && "datos" in parsed ? parsed.datos : parsed;
    return normalizarDatos(bruto);
  } catch {
    return datosVacios();
  }
}

export function guardarDatos(d: Datos): void {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify({ v: VERSION_DATOS, datos: d }));
  } catch {
    /* sin almacenamiento */
  }
}

export function leerConfig(): Config {
  try {
    const raw = localStorage.getItem(CLAVE_CONFIG);
    if (!raw) return { ...CONFIG_DEFECTO };
    const c = JSON.parse(raw) as Partial<Config>;
    return {
      color: typeof c.color === "string" && c.color ? c.color : CONFIG_DEFECTO.color,
      emojis: c.emojis === "mono" || c.emojis === "ninguno" ? c.emojis : CONFIG_DEFECTO.emojis,
      confirmarSalida: c.confirmarSalida !== false,
    };
  } catch {
    return { ...CONFIG_DEFECTO };
  }
}

export function guardarConfig(c: Config): void {
  try {
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(c));
  } catch {
    /* noop */
  }
}

export function leerTema(): Tema {
  try {
    const t = localStorage.getItem(CLAVE_TEMA);
    return t === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function guardarTema(t: Tema): void {
  try {
    localStorage.setItem(CLAVE_TEMA, t);
  } catch {
    /* noop */
  }
}

export function borrarTodo(incluirSemilla = true): void {
  localStorage.removeItem(CLAVE_DATOS);
  localStorage.removeItem(CLAVE_CONFIG);
  localStorage.removeItem(CLAVE_TEMA);
  if (incluirSemilla) localStorage.removeItem(CLAVE_SEMILLA);
}

export { CLAVE_DATOS, CLAVE_CONFIG, CLAVE_TEMA, CLAVE_SEMILLA };
