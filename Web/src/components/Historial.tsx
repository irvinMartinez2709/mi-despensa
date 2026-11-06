import { useMemo, useState } from "react";
import type { Datos, MovimientoPrecio, Tema } from "../types";
import { colorLegible } from "../lib/colores";
import { EstadoVacio, Tarjeta } from "./ui";
import { Icono } from "./iconos";
import { useT } from "../i18n";

function fechaCorta(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function etiquetaCambio(c: MovimientoPrecio["cambio"]): string {
  if (c === "subida") return "Subió";
  if (c === "bajada") return "Bajó";
  if (c === "creado") return "Precio inicial";
  return "Corrección";
}

/** Gráfica simple de líneas del historial de un producto. */
function GraficaPrecios({ movimientos, color }: { movimientos: MovimientoPrecio[]; color: string }) {
  const t = useT();
  const w = 300;
  const h = 90;
  const pad = 8;
  const precios = movimientos.map((m) => m.precio);
  const min = Math.min(...precios);
  const max = Math.max(...precios);
  const rango = max - min || 1;
  const puntos = movimientos.map((m, i) => {
    const x = movimientos.length === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (movimientos.length - 1);
    const y = h - pad - ((m.precio - min) / rango) * (h - pad * 2);
    return { x, y, m };
  });
  const d = puntos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="rounded-2xl border-2 border-borde bg-soft p-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={t("Gráfica de precios")}>
        <path d={`${d} L${puntos[puntos.length - 1].x.toFixed(1)} ${h - pad} L${puntos[0].x.toFixed(1)} ${h - pad} Z`} fill={color} opacity="0.12" />
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {puntos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="rgb(var(--c-card))" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex justify-between px-1 text-[10px] font-bold text-subtinta">
        <span>${min.toFixed(2)}</span>
        <span>
          {fechaCorta(movimientos[0].fecha)} → {fechaCorta(movimientos[movimientos.length - 1].fecha)}
        </span>
        <span>${max.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function Historial({
  datos,
  tema,
  tiendaFija,
}: {
  datos: Datos;
  tema: Tema;
  /** Si se pasa, solo muestra los productos de esa tienda. */
  tiendaFija?: string | null;
}) {
  const t = useT();
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return datos.productos
      .map((p) => {
        const movs = datos.precios
          .filter((m) => m.productoId === p.id)
          .sort((a, b) => a.fecha.localeCompare(b.fecha));
        return { p, movs };
      })
      .filter(({ p, movs }) => {
        if (tiendaFija && p.tiendaId !== tiendaFija) return false;
        if (q && !p.nombre.toLowerCase().includes(q)) return false;
        /* Solo productos cuyo precio cambió (subida/bajada). */
        return movs.some((m) => m.cambio === "subida" || m.cambio === "bajada");
      })
      .sort((a, b) => a.p.nombre.localeCompare(b.p.nombre, "es"));
  }, [datos.productos, datos.precios, busqueda, tiendaFija]);

  const totalCambios = useMemo(() => {
    const ids = new Set(
      datos.productos.filter((p) => !tiendaFija || p.tiendaId === tiendaFija).map((p) => p.id)
    );
    return datos.precios.filter(
      (m) => ids.has(m.productoId) && (m.cambio === "subida" || m.cambio === "bajada")
    ).length;
  }, [datos.productos, datos.precios, tiendaFija]);

  return (
    <div className="animate-fade-in space-y-4">
      <header className="pt-1">
        <h1 className="text-2xl font-black leading-tight text-tinta">{t("Historial de precios")}</h1>
        <p className="text-xs font-medium text-subtinta">
          {totalCambios} {totalCambios === 1 ? t("cambio registrado") : t("cambios registrados")}
        </p>
      </header>

      <div className="relative">
        <Icono
          nombre="buscar"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtinta"
        />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={t("Buscar producto…")}
          className="w-full rounded-2xl border-2 border-borde bg-card py-3 pl-10 pr-4 text-sm text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
        />
      </div>

      {filas.length === 0 ? (
        <EstadoVacio
          icono="reloj"
          titulo={totalCambios === 0 ? t("Sin cambios de precio todavía") : t("Sin resultados")}
          texto={
            totalCambios === 0
              ? t("Cuando modifiques el precio de un producto e indiques si subió o bajó, aparecerá aquí.")
              : t("Prueba con otra búsqueda.")
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filas.map(({ p, movs }) => {
            const actual = movs[movs.length - 1];
            const anterior = movs.length > 1 ? movs[movs.length - 2] : null;
            const subio = anterior ? actual.precio > anterior.precio : false;
            const color = colorLegible(p.color, tema);
            const tienda = datos.tiendas.find((x) => x.id === p.tiendaId);
            const abierta = abierto === p.id;
            return (
              <Tarjeta key={p.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAbierto(abierta ? null : p.id)}
                  className="flex w-full items-start gap-3 p-4 text-left active:bg-soft/40"
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg"
                    style={{ backgroundColor: `${color}1f` }}
                  >
                    <span className="emoji">{p.icono}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-extrabold leading-snug text-tinta">
                      {p.nombre}
                    </span>
                    <span className="block text-[11px] font-semibold text-subtinta">
                      {tienda?.nombre}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="text-subtinta">
                        {t("Anterior")}{" "}
                        <span className="text-tinta line-through">
                          {anterior ? `$${anterior.precio.toFixed(2)}` : "—"}
                        </span>
                      </span>
                      <span className="text-subtinta/60">→</span>
                      <span style={{ color }} className="text-[13px] font-black">
                        ${actual.precio.toFixed(2)}
                      </span>
                      {(actual.cambio === "subida" || actual.cambio === "bajada") && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            subio
                              ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          }`}
                        >
                          {subio ? "↑" : "↓"} {etiquetaCambio(actual.cambio)}
                        </span>
                      )}
                    </span>
                  </span>
                  <Icono
                    nombre="flecha"
                    className={`mt-1 h-4 w-4 shrink-0 text-subtinta transition ${abierta ? "rotate-90" : ""}`}
                  />
                </button>

                {abierta && (
                  <div className="animate-rise space-y-3 border-t border-borde/70 p-4">
                    <GraficaPrecios movimientos={movs} color={color} />
                    <div className="space-y-1.5">
                      {[...movs].reverse().map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-xl bg-soft px-3 py-2 text-[12px]"
                        >
                          <span className="font-semibold text-subtinta">{fechaCorta(m.fecha)}</span>
                          <span
                            className={`font-black ${
                              m.cambio === "subida"
                                ? "text-red-500"
                                : m.cambio === "bajada"
                                  ? "text-emerald-600"
                                  : "text-tinta"
                            }`}
                          >
                            {m.cambio === "subida" ? "↑" : m.cambio === "bajada" ? "↓" : "•"} $
                            {m.precio.toFixed(2)}
                          </span>
                          <span className="w-24 text-right text-[10px] font-bold uppercase text-subtinta">
                            {etiquetaCambio(m.cambio)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Tarjeta>
            );
          })}
        </div>
      )}
    </div>
  );
}
