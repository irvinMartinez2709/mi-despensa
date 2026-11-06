import { useMemo, useState } from "react";
import type { Datos, Tema } from "../types";
import { colorLegible } from "../lib/colores";
import { formatoPrecio } from "../types";
import { Boton, Chip, EstadoVacio, Tarjeta } from "./ui";
import { Icono } from "./iconos";
import { useT } from "../i18n";

export default function Productos({
  datos,
  tema,
  tiendaFija,
  onEditarProducto,
  onEliminarProducto,
  onNuevoProducto,
}: {
  datos: Datos;
  tema: Tema;
  /** Si se pasa, la búsqueda queda limitada a esa tienda (vista interna). */
  tiendaFija?: string | null;
  onEditarProducto: (id: string) => void;
  onEliminarProducto: (id: string) => void;
  onNuevoProducto: () => void;
}) {
  const t = useT();
  const [busqueda, setBusqueda] = useState("");
  const [filtroTienda, setFiltroTienda] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const tiendaFijada = tiendaFija ? datos.tiendas.find((x) => x.id === tiendaFija) : undefined;

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const min = precioMin.trim() ? Number(precioMin.replace(",", ".")) : null;
    const max = precioMax.trim() ? Number(precioMax.replace(",", ".")) : null;
    const lista = datos.productos.filter((p) => {
      if (tiendaFija && p.tiendaId !== tiendaFija) return false;
      if (!tiendaFija && filtroTienda !== "todas" && p.tiendaId !== filtroTienda) return false;
      if (filtroTipo !== "todos" && p.tipoId !== filtroTipo) return false;
      if (min !== null && Number.isFinite(min) && (p.precio === null || p.precio < min)) return false;
      if (max !== null && Number.isFinite(max) && (p.precio === null || p.precio > max)) return false;
      if (q && !p.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
    /* Los que empiezan por lo escrito aparecen primero ("So" → Soda…). */
    return lista.sort((a, b) => {
      const ea = q ? (a.nombre.toLowerCase().startsWith(q) ? 0 : 1) : 0;
      const eb = q ? (b.nombre.toLowerCase().startsWith(q) ? 0 : 1) : 0;
      if (ea !== eb) return ea - eb;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [
    datos.productos,
    busqueda,
    filtroTienda,
    filtroTipo,
    precioMin,
    precioMax,
    tiendaFija,
  ]);

  const tiposVisibles = useMemo(() => {
    const ids = new Set(
      datos.productos
        .filter((p) => (tiendaFija ? p.tiendaId === tiendaFija : filtroTienda === "todas" || p.tiendaId === filtroTienda))
        .map((p) => p.tipoId)
    );
    return datos.tiposProducto.filter((c) => ids.has(c.id));
  }, [datos.productos, datos.tiposProducto, filtroTienda, tiendaFija]);

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex items-end justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-black leading-tight text-tinta">{t("Buscar un producto")}</h1>
          <p className="text-xs font-medium text-subtinta">
            {visibles.length} {visibles.length === 1 ? t("resultado") : t("resultados")}
            {tiendaFijada ? ` · ${tiendaFijada.nombre}` : ""}
          </p>
        </div>
        <Boton onClick={onNuevoProducto} icono="mas" className="px-3 py-2.5 text-[13px]">
          {t("Nuevo")}
        </Boton>
      </header>

      <div className="relative">
        <Icono
          nombre="buscar"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtinta"
        />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={t("Escribe «So» y verás los que empiecen por So…")}
          className="w-full rounded-2xl border-2 border-borde bg-card py-3 pl-10 pr-4 text-sm text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
        />
      </div>

      {!tiendaFija && datos.tiendas.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip activo={filtroTienda === "todas"} onClick={() => setFiltroTienda("todas")}>
            {t("Todas las tiendas")}
          </Chip>
          {datos.tiendas.map((ti) => (
            <Chip key={ti.id} activo={filtroTienda === ti.id} onClick={() => setFiltroTienda(ti.id)}>
              <span className="emoji mr-1">{ti.icono}</span>
              {ti.nombre}
            </Chip>
          ))}
        </div>
      )}

      {tiposVisibles.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip activo={filtroTipo === "todos"} onClick={() => setFiltroTipo("todos")}>
            {t("Todos los tipos")}
          </Chip>
          {tiposVisibles.map((c) => (
            <Chip key={c.id} activo={filtroTipo === c.id} onClick={() => setFiltroTipo(c.id)}>
              <span className="emoji mr-1">{c.icono}</span>
              {c.nombre}
              {c.itbms && " · 7%"}
            </Chip>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <label className="block flex-1">
          <span className="mb-1 block text-[11px] font-bold text-subtinta">{t("Precio mín.")}</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-2xl border-2 border-borde bg-card px-3 py-2.5 text-sm text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
          />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-[11px] font-bold text-subtinta">{t("Precio máx.")}</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            placeholder="99.99"
            className="w-full rounded-2xl border-2 border-borde bg-card px-3 py-2.5 text-sm text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
          />
        </label>
        {(precioMin || precioMax) && (
          <button
            type="button"
            onClick={() => {
              setPrecioMin("");
              setPrecioMax("");
            }}
            className="grid h-[42px] w-[42px] place-items-center rounded-2xl border-2 border-borde bg-card text-subtinta active:scale-95"
            aria-label={t("Quitar filtro de precio")}
          >
            <Icono nombre="cerrar" className="h-4 w-4" />
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <EstadoVacio
          icono="buscar"
          titulo={datos.productos.length === 0 ? t("Aún no hay productos") : t("Sin resultados")}
          texto={
            datos.productos.length === 0
              ? t("Crea un producto para empezar tu catálogo.")
              : t("Prueba con otro filtro o cambia la búsqueda.")
          }
          accion={
            datos.productos.length === 0 ? (
              <Boton onClick={onNuevoProducto} icono="mas">
                {t("Nuevo producto")}
              </Boton>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {visibles.map((p) => {
            const color = colorLegible(p.color, tema);
            const tienda = datos.tiendas.find((x) => x.id === p.tiendaId);
            const tipo = datos.tiposProducto.find((x) => x.id === p.tipoId);
            return (
              <Tarjeta key={p.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => onEditarProducto(p.id)}
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
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] font-semibold text-subtinta">
                      <span>{tienda?.nombre ?? t("Sin tienda")}</span>
                      {tipo && (
                        <>
                          <span className="text-subtinta/60">•</span>
                          <span style={{ color }}>
                            {tipo.nombre}
                            {tipo.itbms && " · ITBMS 7%"}
                          </span>
                        </>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span
                      className={`block text-[15px] font-black leading-tight ${
                        p.precio === null ? "text-subtinta" : "text-tinta"
                      }`}
                    >
                      {formatoPrecio(p.precio)}
                    </span>
                    {p.precio === null && (
                      <span className="block text-[10px] font-semibold uppercase text-subtinta">
                        {t("sin precio")}
                      </span>
                    )}
                  </span>
                </button>
                <div className="flex items-center justify-end gap-1.5 border-t border-borde/70 px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => onEditarProducto(p.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-subtinta active:bg-soft"
                  >
                    <Icono nombre="lapiz" className="h-3.5 w-3.5" />
                    {t("Editar")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEliminarProducto(p.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-red-500 active:bg-red-500/10"
                  >
                    <Icono nombre="basura" className="h-3.5 w-3.5" />
                    {t("Eliminar")}
                  </button>
                </div>
              </Tarjeta>
            );
          })}
        </div>
      )}
    </div>
  );
}
