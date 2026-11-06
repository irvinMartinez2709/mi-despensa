import { useMemo, useState } from "react";
import type { Datos, Tema } from "../types";
import { colorLegible } from "../lib/colores";
import { Boton, BotonIcono, Chip, EstadoVacio, Tarjeta } from "./ui";
import { Icono } from "./iconos";
import { useT } from "../i18n";

export default function Tiendas({
  datos,
  tema,
  onAbrirTienda,
  onNuevaTienda,
  onEditarTienda,
  onEliminarTienda,
  onAjustes,
}: {
  datos: Datos;
  tema: Tema;
  onAbrirTienda: (id: string) => void;
  onNuevaTienda: () => void;
  onEditarTienda: (id: string) => void;
  onEliminarTienda: (id: string) => void;
  onAjustes: () => void;
}) {
  const t = useT();
  const [filtro, setFiltro] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState("");

  const cambios = useMemo(
    () => datos.precios.filter((p) => p.cambio === "subida" || p.cambio === "bajada").length,
    [datos.precios]
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return datos.tiendas.filter((ti) => {
      const cat = datos.tiposTienda.find((c) => c.id === ti.tipoId);
      const coincideTipo = filtro === "todas" || ti.tipoId === filtro;
      const coincideTexto =
        !q ||
        ti.nombre.toLowerCase().includes(q) ||
        ti.lugar.toLowerCase().includes(q) ||
        (cat?.nombre.toLowerCase().includes(q) ?? false);
      return coincideTipo && coincideTexto;
    });
  }, [datos.tiendas, datos.tiposTienda, filtro, busqueda]);

  const stats = [
    { valor: datos.tiendas.length, label: datos.tiendas.length === 1 ? t("tienda") : t("tiendas") },
    { valor: datos.productos.length, label: t("productos") },
    { valor: datos.listas.length, label: t("listas") },
    { valor: cambios, label: t("cambios de precio") },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex items-end justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-black leading-tight text-tinta">{t("Tiendas")}</h1>
          <p className="text-xs font-medium text-subtinta">
            {datos.tiendas.length} {datos.tiendas.length === 1 ? t("registrada") : t("registradas")}
          </p>
        </div>
        <div className="flex gap-2">
          <BotonIcono nombre="ajustes" onClick={onAjustes} label={t("Ajustes")} />
          <Boton onClick={onNuevaTienda} icono="mas" className="px-3 py-2.5 text-[13px]">
            {t("Nueva")}
          </Boton>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <Tarjeta key={s.label} className="px-2 py-3 text-center">
            <span className="block text-lg font-black leading-none text-acc">{s.valor}</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-subtinta">
              {s.label}
            </span>
          </Tarjeta>
        ))}
      </div>

      <div className="relative">
        <Icono
          nombre="buscar"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtinta"
        />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={t("Buscar tienda o lugar…")}
          className="w-full rounded-2xl border-2 border-borde bg-card py-3 pl-10 pr-4 text-sm text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
        />
      </div>

      {datos.tiposTienda.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip activo={filtro === "todas"} onClick={() => setFiltro("todas")}>
            {t("Todas")}
          </Chip>
          {datos.tiposTienda.map((c) => (
            <Chip key={c.id} activo={filtro === c.id} onClick={() => setFiltro(c.id)}>
              <span className="emoji mr-1">{c.icono}</span>
              {c.nombre}
            </Chip>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <EstadoVacio
          icono="tienda"
          titulo={datos.tiendas.length === 0 ? t("Aún no hay tiendas") : t("Sin resultados")}
          texto={
            datos.tiendas.length === 0
              ? t("Crea tu primera tienda para empezar a registrar sus productos.")
              : t("Prueba con otro filtro o cambia la búsqueda.")
          }
          accion={
            datos.tiendas.length === 0 ? (
              <Boton onClick={onNuevaTienda} icono="mas">
                {t("Nueva tienda")}
              </Boton>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {visibles.map((ti) => {
            const color = colorLegible(ti.color, tema);
            const cat = datos.tiposTienda.find((c) => c.id === ti.tipoId);
            const nProd = datos.productos.filter((p) => p.tiendaId === ti.id).length;
            return (
              <Tarjeta key={ti.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => onAbrirTienda(ti.id)}
                  className="flex w-full items-start gap-3 p-4 text-left active:bg-soft/40"
                >
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl"
                    style={{ backgroundColor: `${color}1f` }}
                  >
                    <span className="emoji">{ti.icono}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[15px] font-extrabold leading-snug text-tinta">
                      {ti.nombre}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold">
                      <span style={{ color }}>{cat ? cat.nombre : t("Sin categoría")}</span>
                      <span className="text-subtinta/60">•</span>
                      <span className="text-subtinta">
                        {nProd} {nProd === 1 ? t("producto") : t("productos")}
                      </span>
                    </span>
                    {ti.lugar && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-subtinta">
                        <Icono nombre="meta" className="h-3 w-3" />
                        {ti.lugar}
                      </span>
                    )}
                  </span>
                  <Icono nombre="flecha" className="mt-1 h-4 w-4 shrink-0 text-subtinta" />
                </button>
                <div className="flex items-center justify-end gap-1.5 border-t border-borde/70 px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => onEditarTienda(ti.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-subtinta active:bg-soft"
                  >
                    <Icono nombre="lapiz" className="h-3.5 w-3.5" />
                    {t("Editar")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEliminarTienda(ti.id)}
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

      <button
        type="button"
        onClick={onNuevaTienda}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-borde bg-card px-4 py-3 text-sm font-bold text-subtinta active:scale-[0.99]"
      >
        <Icono nombre="mas" className="h-4 w-4" />
        {t("Añadir otra tienda")}
      </button>
    </div>
  );
}
