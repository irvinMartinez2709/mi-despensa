import { useEffect, useState } from "react";
import type { Categoria, Producto, Tienda } from "../types";
import { COLORES_MARCA, ICONOS_MARCA, formatoPrecio, parsearPrecio } from "../types";
import { Boton, Campo, Hoja, Segmentado, Selector } from "./ui";
import { CampoMarca, CampoCategoria } from "./marcas";
import { useT } from "../i18n";

export interface BorradorProducto {
  nombre: string;
  precio: number | null;
  tiendaId: string;
  tipoId: string;
  color: string;
  icono: string;
}

export type CambioPrecio = "subida" | "bajada" | "correccion";

const VACIO: BorradorProducto = {
  nombre: "",
  precio: null,
  tiendaId: "",
  tipoId: "",
  color: COLORES_MARCA[0],
  icono: ICONOS_MARCA[0],
};

export function EditorProducto({
  abierta,
  onCerrar,
  producto,
  tiendas,
  categorias,
  tiendaFija,
  onCrearCategoria,
  onGuardar,
  onEliminar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  producto?: Producto | null;
  tiendas: Tienda[];
  categorias: Categoria[];
  /** Si se crea desde dentro de una tienda, esa queda fija. */
  tiendaFija?: string | null;
  onCrearCategoria: (nombre: string, itbms: boolean) => Categoria;
  onGuardar: (borrador: BorradorProducto, cambio?: CambioPrecio) => void;
  onEliminar?: () => void;
}) {
  const t = useT();
  const [borrador, setBorrador] = useState<BorradorProducto>(VACIO);
  const [precioTexto, setPrecioTexto] = useState("");
  const [cambio, setCambio] = useState<CambioPrecio>("subida");

  const precioOriginal = producto?.precio ?? null;

  useEffect(() => {
    if (!abierta) return;
    setBorrador(
      producto
        ? {
            nombre: producto.nombre,
            precio: producto.precio,
            tiendaId: producto.tiendaId,
            tipoId: producto.tipoId,
            color: producto.color,
            icono: producto.icono,
          }
        : {
            ...VACIO,
            tiendaId: tiendaFija || tiendas[0]?.id || "",
            tipoId: categorias[0]?.id || "",
            color: COLORES_MARCA[Math.floor(Math.random() * COLORES_MARCA.length)],
          }
    );
    setPrecioTexto(producto?.precio !== null && producto?.precio !== undefined ? String(producto.precio) : "");
    setCambio("subida");
  }, [abierta, producto, tiendaFija]); // eslint-disable-line react-hooks/exhaustive-deps

  const precioNuevo = parsearPrecio(precioTexto);
  const precioCambio = producto !== null && producto !== undefined && precioNuevo !== precioOriginal;

  function guardar() {
    if (!borrador.nombre.trim()) return;
    const base: BorradorProducto = { ...borrador, nombre: borrador.nombre.trim(), precio: precioNuevo };
    if (producto && precioCambio && cambio !== "correccion" && precioNuevo === null) {
      /* Quitar el precio no genera movimiento de historial. */
      onGuardar(base, "correccion");
    } else if (producto && precioCambio) {
      onGuardar(base, cambio);
    } else {
      onGuardar(base);
    }
    onCerrar();
  }

  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={producto ? t("Editar producto") : t("Nuevo producto")}
      alto
      pie={
        <div className="flex gap-2">
          {producto && onEliminar && (
            <Boton variante="peligro" onClick={onEliminar} className="px-3">
              {t("Eliminar")}
            </Boton>
          )}
          <Boton variante="contorno" className="flex-1" onClick={onCerrar}>
            {t("Cancelar")}
          </Boton>
          <Boton className="flex-1" onClick={guardar} disabled={!borrador.nombre.trim()}>
            {t("Guardar")}
          </Boton>
        </div>
      }
    >
      <div className="space-y-4">
        <Campo
          label={t("Nombre")}
          value={borrador.nombre}
          onChange={(v) => setBorrador((b) => ({ ...b, nombre: v }))}
          placeholder={t("Ej. Jamonilla, Soda 3L, Arroz…")}
          autoFocus
        />

        <Campo
          label={t("Precio")}
          value={precioTexto}
          onChange={setPrecioTexto}
          tipo="number"
          paso="0.01"
          min="0"
          placeholder={t("Vacío si aún no lo sabes")}
          ayuda={`${t("Se guarda para el historial. Actualmente:")} ${formatoPrecio(producto?.precio ?? null)}`}
        />

        {producto && precioCambio && (
          <div className="space-y-2 rounded-2xl border-2 border-borde bg-soft p-3">
            <span className="block text-sm font-semibold text-subtinta">
              {t("¿Qué pasó con el precio?")}
            </span>
            <Segmentado
              valor={cambio}
              onChange={setCambio}
              opciones={[
                { id: "subida", texto: `↑ ${t("Subida")}` },
                { id: "bajada", texto: `↓ ${t("Bajada")}` },
                { id: "correccion", texto: t("Corrección") },
              ]}
            />
            <p className="text-[11px] leading-relaxed text-subtinta">
              {cambio === "correccion"
                ? t("Se corrige el precio sin registrarlo en el historial.")
                : t("Se guardará en el historial de precios con la fecha de hoy.")}
            </p>
          </div>
        )}

        {!tiendaFija ? (
          <Selector
            label={t("¿Dónde lo venden?")}
            valor={borrador.tiendaId}
            onChange={(id) => setBorrador((b) => ({ ...b, tiendaId: id }))}
            placeholder={t("Selecciona una tienda…")}
            opciones={tiendas.map((ti) => ({ id: ti.id, texto: ti.nombre, detalle: ti.lugar }))}
          />
        ) : (
          <div className="rounded-2xl border-2 border-borde bg-soft px-4 py-3 text-sm font-semibold text-tinta">
            {t("Tienda")}: {tiendas.find((x) => x.id === tiendaFija)?.nombre}
          </div>
        )}

        <CampoCategoria
          label={t("Tipo de producto")}
          valor={borrador.tipoId}
          opciones={categorias}
          onChange={(id) => setBorrador((b) => ({ ...b, tipoId: id }))}
          onCrear={(nombre, itbms) => {
            const creada = onCrearCategoria(nombre, itbms);
            setBorrador((b) => ({ ...b, tipoId: creada.id }));
          }}
          conItbms
        />

        <CampoMarca
          icono={borrador.icono}
          color={borrador.color}
          onIcono={(v) => setBorrador((b) => ({ ...b, icono: v }))}
          onColor={(v) => setBorrador((b) => ({ ...b, color: v }))}
          etiqueta={t("Icono o emoji del producto")}
        />
      </div>
    </Hoja>
  );
}
