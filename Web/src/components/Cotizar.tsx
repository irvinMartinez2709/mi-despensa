import { useMemo, useState } from "react";
import type { Datos } from "../types";
import { ITBMS_PORCENTAJE, formatoPrecio } from "../types";
import { Boton, Chip, EstadoVacio, Tarjeta } from "./ui";
import { Icono } from "./iconos";
import { useT } from "../i18n";

interface Linea {
  productoId: string;
  nombre: string;
  icono: string;
  cantidad: number;
  unitario: number;
  itbms: number;
  total: number;
}

export default function Cotizar({ datos, tiendaFija }: { datos: Datos; tiendaFija?: string | null }) {
  const t = useT();
  const [tiendaId, setTiendaId] = useState<string | null>(tiendaFija ?? null);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [verDetalles, setVerDetalles] = useState(false);

  const tienda = tiendaId ? datos.tiendas.find((x) => x.id === tiendaId) ?? null : null;

  const productos = useMemo(
    () => (tiendaId ? datos.productos.filter((p) => p.tiendaId === tiendaId) : []),
    [datos.productos, tiendaId]
  );

  const lineas: Linea[] = useMemo(() => {
    const out: Linea[] = [];
    for (const p of productos) {
      const cantidad = cantidades[p.id] || 0;
      if (cantidad <= 0 || p.precio === null) continue;
      const unitario = p.precio;
      const bruto = unitario * cantidad;
      const cat = datos.tiposProducto.find((c) => c.id === p.tipoId);
      const itbms = cat?.itbms ? Math.round(bruto * ITBMS_PORCENTAJE * 100) / 100 : 0;
      out.push({
        productoId: p.id,
        nombre: p.nombre,
        icono: p.icono,
        cantidad,
        unitario,
        itbms,
        total: Math.round((bruto + itbms) * 100) / 100,
      });
    }
    return out;
  }, [productos, cantidades, datos.tiposProducto]);

  const subtotal = Math.round(lineas.reduce((s, l) => s + l.unitario * l.cantidad, 0) * 100) / 100;
  const itbmsTotal = Math.round(lineas.reduce((s, l) => s + l.itbms, 0) * 100) / 100;
  const totalPagar = Math.round((subtotal + itbmsTotal) * 100) / 100;
  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);

  function sumar(id: string, delta: number) {
    setCantidades((c) => {
      const n = Math.max(0, (c[id] || 0) + delta);
      const copia = { ...c };
      if (n === 0) delete copia[id];
      else copia[id] = n;
      return copia;
    });
  }

  function vaciar() {
    setCantidades({});
    setVerDetalles(false);
  }

  /* ------------------------- selección de tienda ------------------------- */
  if (!tiendaId || !tienda) {
    const conProductos = datos.tiendas.filter((ti) => datos.productos.some((p) => p.tiendaId === ti.id));
    return (
      <div className="animate-fade-in space-y-4">
        <header className="pt-1">
          <h1 className="text-2xl font-black leading-tight text-tinta">{t("Cotizar")}</h1>
          <p className="text-xs font-medium text-subtinta">{t("Selecciona una tienda para empezar")}</p>
        </header>
        {conProductos.length === 0 ? (
          <EstadoVacio
            icono="recibo"
            titulo={t("Nada que cotizar todavía")}
            texto={t("Crea tiendas y productos con precio para poder cotizar.")}
          />
        ) : (
          <div className="space-y-2.5">
            {conProductos.map((ti) => {
              const n = datos.productos.filter((p) => p.tiendaId === ti.id && p.precio !== null).length;
              return (
                <Tarjeta key={ti.id} onClick={() => setTiendaId(ti.id)} className="flex items-center gap-3 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-acc-suave text-lg">
                    <span className="emoji">{ti.icono}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-extrabold text-tinta">{ti.nombre}</span>
                    <span className="block text-[11px] font-semibold text-subtinta">
                      {n} {n === 1 ? t("producto con precio") : t("productos con precio")}
                    </span>
                  </span>
                  <Icono nombre="flecha" className="h-4 w-4 shrink-0 text-subtinta" />
                </Tarjeta>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ----------------------------- cotizando ----------------------------- */
  const conPrecio = productos.filter((p) => p.precio !== null);
  const sinPrecio = productos.filter((p) => p.precio === null);

  return (
    <div className="animate-fade-in space-y-4 pb-56">
      <header className="flex items-end justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-black leading-tight text-tinta">{t("Cotizar")}</h1>
          <p className="flex items-center gap-1.5 text-xs font-medium text-subtinta">
            <span className="emoji">{tienda.icono}</span>
            {tienda.nombre}
          </p>
        </div>
        {unidades > 0 && (
          <Boton variante="contorno" onClick={vaciar} className="px-3 py-2.5 text-[13px]">
            {t("Vaciar")}
          </Boton>
        )}
      </header>

      {!tiendaFija && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {datos.tiendas
            .filter((x) => x.id !== tienda.id)
            .map((x) => (
              <Chip
                key={x.id}
                activo={false}
                onClick={() => {
                  setTiendaId(x.id);
                  setCantidades({});
                  setVerDetalles(false);
                }}
              >
                <span className="emoji mr-1">{x.icono}</span>
                {x.nombre}
              </Chip>
            ))}
        </div>
      )}

      {conPrecio.length === 0 ? (
        <EstadoVacio
          icono="recibo"
          titulo={t("Esta tienda no tiene productos con precio")}
          texto={t("Coloca precios a sus productos para poder cotizar.")}
        />
      ) : (
        <div className="space-y-2">
          {conPrecio.map((p) => {
            const cantidad = cantidades[p.id] || 0;
            const cat = datos.tiposProducto.find((c) => c.id === p.tipoId);
            return (
              <Tarjeta key={p.id} className="flex items-center gap-3 p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-lg">
                  <span className="emoji">{p.icono}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-tinta">{p.nombre}</span>
                  <span className="block text-[11px] font-semibold text-subtinta">
                    {formatoPrecio(p.precio)}
                    {cat?.itbms && (
                      <span className="ml-1.5 rounded-full bg-acc-suave px-1.5 py-0.5 text-[9px] font-black text-acc">
                        +7%
                      </span>
                    )}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => sumar(p.id, -1)}
                    disabled={cantidad === 0}
                    aria-label={t("Quitar uno")}
                    className="grid h-9 w-9 place-items-center rounded-xl border-2 border-borde bg-card text-lg font-black text-tinta transition active:scale-90 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span
                    className={`w-7 text-center text-[15px] font-black ${
                      cantidad > 0 ? "text-acc" : "text-subtinta/50"
                    }`}
                  >
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => sumar(p.id, 1)}
                    aria-label={t("Añadir uno")}
                    className="grid h-9 w-9 place-items-center rounded-xl border-2 border-acc bg-acc text-lg font-black text-onacc transition active:scale-90"
                  >
                    +
                  </button>
                </span>
              </Tarjeta>
            );
          })}

          {sinPrecio.length > 0 && (
            <p className="px-1 pt-1 text-[11px] font-semibold text-subtinta">
              {sinPrecio.length} {sinPrecio.length === 1 ? t("producto sin precio (no aparece en la factura)") : t("productos sin precio (no aparecen en la factura)")}
            </p>
          )}
        </div>
      )}

      {/* Barra inferior: factura desplegable + total */}
      {conPrecio.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[64px] z-20 mx-auto w-full max-w-2xl px-4 pb-3">
          {verDetalles && lineas.length > 0 && (
            <div className="pointer-events-auto animate-rise mb-2 max-h-[46vh] overflow-y-auto smooth-scroll rounded-3xl border-2 border-borde bg-card p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wide text-subtinta">
                  {t("Detalle de la factura")}
                </span>
                <button
                  type="button"
                  onClick={() => setVerDetalles(false)}
                  aria-label={t("Cerrar")}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-soft text-subtinta active:scale-95"
                >
                  <Icono nombre="cerrar" className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  <div className="grid grid-cols-[36px_1fr_54px_58px_58px] gap-2 border-y-2 border-borde py-1 text-[9.5px] font-black uppercase tracking-wide text-subtinta">
                    <span>{t("Cant.")}</span>
                    <span>{t("Descripción")}</span>
                    <span className="text-right">ITBMS 7%</span>
                    <span className="text-right">{t("P. indiv.")}</span>
                    <span className="text-right">{t("Total")}</span>
                  </div>
                  {lineas.map((l) => (
                    <div
                      key={l.productoId}
                      className="grid grid-cols-[36px_1fr_54px_58px_58px] gap-2 border-b border-borde/60 py-1.5 text-[11px] font-semibold text-tinta"
                    >
                      <span className="font-black">{l.cantidad}</span>
                      <span className="truncate">{l.nombre}</span>
                      <span className="text-right text-subtinta">
                        {l.itbms > 0 ? `$${l.itbms.toFixed(2)}` : "—"}
                      </span>
                      <span className="text-right">${l.unitario.toFixed(2)}</span>
                      <span className="text-right font-black">${l.total.toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="mt-2 space-y-1 text-[12px] font-bold text-tinta">
                    <div className="flex justify-between">
                      <span className="text-subtinta">{t("Subtotal:")}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtinta">ITBMS (7%):</span>
                      <span>${itbmsTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-2 border-t-2 border-borde pt-2 text-center">
                    <span className="block text-[11px] font-black uppercase tracking-wide text-subtinta">
                      {t("Total a pagar")}
                    </span>
                    <span className="block text-3xl font-black leading-tight text-acc">
                      ${totalPagar.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pointer-events-auto flex items-center gap-2 rounded-3xl border-2 border-borde bg-card p-2.5 shadow-xl">
            <div className="min-w-0 flex-1 px-2">
              <span className="block text-[10px] font-black uppercase tracking-wide text-subtinta">
                {t("Total")} · {unidades} {unidades === 1 ? t("unidad") : t("unidades")}
              </span>
              <span className="block text-xl font-black leading-tight text-acc">
                ${totalPagar.toFixed(2)}
              </span>
            </div>
            {lineas.length > 0 && (
              <Boton
                variante={verDetalles ? "suave" : "primario"}
                onClick={() => setVerDetalles((v) => !v)}
                icono={verDetalles ? "cerrar" : "recibo"}
                className="shrink-0 px-3 text-[13px]"
              >
                {verDetalles ? t("Ocultar") : t("Ver detalles")}
              </Boton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
