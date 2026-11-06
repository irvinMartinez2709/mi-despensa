import type { Config, Datos, Tema } from "../types";
import { normalizarDatos } from "./almacen";
import { guardarOCompartir, type ResultadoGuardar } from "./archivos";

export const VERSION_RESPALDO = 1;

export function construirRespaldo(datos: Datos, config: Config, tema: Tema): string {
  return JSON.stringify(
    {
      app: "Mi Despensa",
      version: VERSION_RESPALDO,
      fecha: new Date().toISOString(),
      datos,
      config,
      tema,
    },
    null,
    2
  );
}

/** Guarda el respaldo en el dispositivo (hoja nativa de Android) o lo descarga. */
export function guardarRespaldo(nombre: string, contenido: string): Promise<ResultadoGuardar> {
  return guardarOCompartir({
    nombre,
    contenido,
    tipo: "application/json",
    titulo: "Mi Despensa",
    texto: "Respaldo de datos de Mi Despensa",
  });
}

export interface RespaldoImportado {
  ok: boolean;
  datos?: Datos;
  config?: Partial<Config>;
  tema?: Tema;
  mensaje: string;
}

export function importarRespaldo(texto: string): RespaldoImportado {
  try {
    const obj = JSON.parse(texto);
    if (!obj || typeof obj !== "object") {
      return { ok: false, mensaje: "El archivo no tiene el formato esperado." };
    }
    const bruto = "datos" in obj ? obj.datos : obj;
    if (!bruto || typeof bruto !== "object" || !Array.isArray(bruto.tiendas)) {
      return { ok: false, mensaje: "No se encontraron tiendas en el archivo." };
    }
    const datos = normalizarDatos(bruto);
    const config = obj.config && typeof obj.config === "object" ? (obj.config as Partial<Config>) : undefined;
    const tema = obj.tema === "dark" || obj.tema === "light" ? (obj.tema as Tema) : undefined;
    return {
      ok: true,
      datos,
      config,
      tema,
      mensaje: `Se importaron ${datos.tiendas.length} tiendas y ${datos.productos.length} productos.`,
    };
  } catch {
    return { ok: false, mensaje: "El archivo no es un JSON válido." };
  }
}
