import { useEffect, useState } from "react";
import type { ListaCompras, Producto, Tienda } from "../types";
import { formatoPrecio } from "../types";
import { Boton, Campo, Hoja, Selector } from "./ui";
import { Icono } from "./iconos";
import { useT } from "../i18n";

export interface BorradorLista {
  nombre: string;
  tiendaId: string;
  items: { productoId: string; marcado: boolean }[];
}

function nombreSugerido(tienda?: Tienda): string {
  const fecha = new Date().toLocaleDateString("es-PA", { day: "2-digit", month: "long" });
  return tienda ? `Lista de ${tienda.nombre} · ${fecha}` : `Lista · ${fecha}`;
}

export function EditorLista({
  abierta,
  onCerrar,
  lista,
  tiendas,
  productos,
  onGuardar,
  onEliminar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  lista?: ListaCompras | null;
  tiendas: Tienda[];
  /** Todos los productos (se filtran por la tienda elegida). */
  productos: Producto[];
  onGuardar: (borrador: BorradorLista) => void;
  onEliminar?: () => void;
}) {
  const t = useT();
  const [borrador, setBorrador] = useState<BorradorLista>({ nombre: "", tiendaId: "", items: [] });

  const tiendaActual = tiendas.find((x) => x.id === borrador.tiendaId);
  const productosTienda = productos.filter((p) => p.tiendaId === borrador.tiendaId);

  useEffect(() => {
    if (!abierta) return;
    if (lista) {
      setBorrador({ nombre: lista.nombre, tiendaId: lista.tiendaId, items: [...lista.items] });
    } else {
      const primera = tiendas[0];
      setBorrador({ nombre: "", tiendaId: primera?.id || "", items: [] });
    }
  }, [abierta, lista, tiendas]);

  function cambiarTienda(id: string) {
    setBorrador((b) => ({ ...b, tiendaId: id, items: b.items.filter((i) => productos.some((p) => p.id === i.productoId && p.tiendaId === id)) }));
  }

  function alternar(productoId: string) {
    setBorrador((b) => {
      const existe = b.items.some((i) => i.productoId === productoId);
      return {
        ...b,
        items: existe
          ? b.items.filter((i) => i.productoId !== productoId)
          : [...b.items, { productoId, marcado: false }],
      };
    });
  }

  function guardar() {
    const nombre = borrador.nombre.trim() || nombreSugerido(tiendaActual);
    if (!borrador.tiendaId) return;
    onGuardar({ ...borrador, nombre });
    onCerrar();
  }

  const seleccionados = new Set(borrador.items.map((i) => i.productoId));

  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={lista ? t("Editar lista") : t("Nueva lista de compras")}
      alto
      pie={
        <div className="flex gap-2">
          {lista && onEliminar && (
            <Boton variante="peligro" onClick={onEliminar} className="px-3">
              {t("Eliminar")}
            </Boton>
          )}
          <Boton variante="contorno" className="flex-1" onClick={onCerrar}>
            {t("Cancelar")}
          </Boton>
          <Boton
            className="flex-1"
            onClick={guardar}
            disabled={!borrador.tiendaId || borrador.items.length === 0}
          >
            {t("Guardar")}
          </Boton>
        </div>
      }
    >
      <div className="space-y-4">
        <Selector
          label={t("Selecciona la tienda")}
          valor={borrador.tiendaId}
          onChange={cambiarTienda}
          placeholder={t("Elige una tienda…")}
          opciones={tiendas.map((ti) => ({ id: ti.id, texto: ti.nombre, detalle: ti.lugar }))}
        />

        <Campo
          label={`${t("Nombre de la lista")} (${t("opcional")})`}
          value={borrador.nombre}
          onChange={(v) => setBorrador((b) => ({ ...b, nombre: v }))}
          placeholder={nombreSugerido(tiendaActual)}
        />

        <div>
          <span className="mb-1 block text-sm font-semibold text-subtinta">
            {t("Elige los productos")}
          </span>
          {productosTienda.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-borde px-4 py-6 text-center text-sm text-subtinta">
              {borrador.tiendaId
                ? t("Esta tienda aún no tiene productos.")
                : t("Primero selecciona una tienda.")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {productosTienda.map((p) => {
                const activo = seleccionados.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => alternar(p.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition active:scale-[0.99] ${
                      activo ? "border-acc bg-acc-suave" : "border-borde bg-soft"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${
                        activo ? "border-acc bg-acc text-onacc" : "border-borde bg-card"
                      }`}
                    >
                      {activo && <Icono nombre="check" className="h-3 w-3" grosor={3} />}
                    </span>
                    <span className="emoji">{p.icono}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-tinta">
                      {p.nombre}
                    </span>
                    <span className="shrink-0 text-[12px] font-black text-subtinta">
                      {formatoPrecio(p.precio)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {borrador.items.length > 0 && (
            <p className="mt-2 text-[11px] font-bold text-acc">
              {borrador.items.length} {borrador.items.length === 1 ? t("producto seleccionado") : t("productos seleccionados")}
            </p>
          )}
        </div>
      </div>
    </Hoja>
  );
}

/* ---------------------------------------------------------------- */
/* Vista para marcar/desmarcar mientras se compra                    */
/* ---------------------------------------------------------------- */

export function VistaLista({
  abierta,
  onCerrar,
  lista,
  productos,
  tienda,
  onToggle,
  onMarcarTodo,
  onEditar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  lista: ListaCompras | null;
  productos: Producto[];
  tienda?: Tienda;
  onToggle: (productoId: string) => void;
  onMarcarTodo: (marcar: boolean) => void;
  onEditar: () => void;
}) {
  const t = useT();
  if (!lista) return null;

  const total = lista.items.length;
  const marcados = lista.items.filter((i) => i.marcado).length;
  const completo = total > 0 && marcados === total;

  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={lista.nombre}
      alto
      pie={
        <div className="flex gap-2">
          <Boton variante="contorno" className="flex-1" onClick={onEditar} icono="lapiz">
            {t("Editar")}
          </Boton>
          <Boton
            variante={completo ? "suave" : "primario"}
            className="flex-1"
            onClick={() => onMarcarTodo(!completo)}
            icono="check"
          >
            {completo ? t("Desmarcar todo") : t("Marcar todo")}
          </Boton>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-2xl bg-soft px-4 py-3">
          <span className="emoji text-xl">{tienda?.icono ?? "🛒"}</span>
          <span className="flex-1 text-sm font-bold text-tinta">{tienda?.nombre}</span>
          <span className={`text-sm font-black ${completo ? "text-emerald-600" : "text-acc"}`}>
            {marcados}/{total}
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label={t("Imprimir o guardar como PDF")}
            title={t("Imprimir o guardar como PDF")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-borde bg-card text-acc transition active:scale-95"
          >
            <Icono nombre="imprimir" className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          {lista.items.map((item) => {
            const p = productos.find((x) => x.id === item.productoId);
            if (!p) return null;
            return (
              <button
                key={item.productoId}
                type="button"
                onClick={() => onToggle(item.productoId)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition active:scale-[0.99] ${
                  item.marcado ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "border-borde bg-soft"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                    item.marcado
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-borde bg-card"
                  }`}
                >
                  {item.marcado && <Icono nombre="check" className="h-3.5 w-3.5" grosor={3} />}
                </span>
                <span className="emoji">{p.icono}</span>
                <span
                  className={`min-w-0 flex-1 truncate text-sm font-bold ${
                    item.marcado ? "text-subtinta line-through" : "text-tinta"
                  }`}
                >
                  {p.nombre}
                </span>
                <span className="shrink-0 text-[12px] font-black text-subtinta">
                  {formatoPrecio(p.precio)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] font-semibold text-subtinta">
          {t("Toca un producto para marcarlo como comprado.")}
        </p>
      </div>
    </Hoja>
  );
}

/* ---------------------------------------------------------------- */
/* Versión para imprimir o guardar como PDF (solo se ve al imprimir) */
/* ---------------------------------------------------------------- */

export function ListaImpresion({
  lista,
  productos,
  tienda,
}: {
  lista: ListaCompras | null;
  productos: Producto[];
  tienda?: Tienda;
}) {
  if (!lista) return null;
  const fecha = new Date().toLocaleDateString("es-PA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="lista-impresion">
      <div style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div
          style={{
            borderBottom: "2pt solid #111e2e",
            paddingBottom: "6pt",
            marginBottom: "4pt",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: "9pt", fontWeight: 700, letterSpacing: "1pt" }}>
            MI DESPENSA
          </span>
          <span style={{ fontSize: "9pt" }}>{fecha}</span>
        </div>

        <h1 style={{ fontSize: "20pt", fontWeight: 900, margin: "0 0 2pt" }}>
          {lista.nombre}
        </h1>
        <p style={{ fontSize: "11pt", margin: "0 0 12pt", fontWeight: 600 }}>
          {tienda?.nombre ?? ""}
          {tienda?.lugar ? ` · ${tienda.lugar}` : ""}
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {lista.items.map((item) => {
              const p = productos.find((x) => x.id === item.productoId);
              if (!p) return null;
              return (
                <tr key={item.productoId} style={{ borderBottom: "0.5pt solid #9aa7b5" }}>
                  <td style={{ padding: "7pt 4pt", width: "22pt", verticalAlign: "middle" }}>
                    <span className="casilla" />
                  </td>
                  <td style={{ padding: "7pt 4pt", fontSize: "12pt", fontWeight: 700 }}>
                    {p.nombre}
                  </td>
                  <td
                    style={{
                      padding: "7pt 4pt",
                      fontSize: "11pt",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.precio !== null ? `$${p.precio.toFixed(2)}` : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p style={{ fontSize: "8.5pt", marginTop: "14pt", color: "#58687e" }}>
          Marca con una X lo que ya lleves. {lista.items.length} productos en total.
        </p>
      </div>
    </div>
  );
}
