import type { Datos } from "../types";
import { colorLegible } from "../lib/colores";
import type { Tema } from "../types";
import { BarraProgreso, Boton, EstadoVacio, Tarjeta, TituloSeccion } from "./ui";
import { Icono } from "./iconos";
import { useT } from "../i18n";

export default function Crear({
  datos,
  tema,
  onCrearTienda,
  onCrearProducto,
  onCrearLista,
  onAbrirLista,
  onEditarLista,
  onEliminarLista,
}: {
  datos: Datos;
  tema: Tema;
  onCrearTienda: () => void;
  onCrearProducto: () => void;
  onCrearLista: () => void;
  onAbrirLista: (id: string) => void;
  onEditarLista: (id: string) => void;
  onEliminarLista: (id: string) => void;
}) {
  const t = useT();

  const opciones = [
    { id: "tienda" as const, icono: "tienda" as const, titulo: t("Crear tienda"), texto: t("Nombre, tipo y lugar") },
    { id: "producto" as const, icono: "carrito" as const, titulo: t("Crear un producto"), texto: t("Precio, tienda y categoría") },
    { id: "lista" as const, icono: "lista" as const, titulo: t("Crear una lista"), texto: t("Para marcar en la tienda") },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <header className="pt-1">
        <h1 className="text-2xl font-black leading-tight text-tinta">{t("Crear")}</h1>
        <p className="text-xs font-medium text-subtinta">{t("¿Qué quieres agregar hoy?")}</p>
      </header>

      <div className="space-y-2.5">
        {opciones.map((o) => (
          <Tarjeta
            key={o.id}
            onClick={o.id === "tienda" ? onCrearTienda : o.id === "producto" ? onCrearProducto : onCrearLista}
            className="flex items-center gap-3 p-4"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-acc-suave text-acc">
              <Icono nombre={o.icono} className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold text-tinta">{o.titulo}</span>
              <span className="block text-[11px] font-semibold text-subtinta">{o.texto}</span>
            </span>
            <Icono nombre="flecha" className="h-4 w-4 shrink-0 text-subtinta" />
          </Tarjeta>
        ))}
      </div>

      <div>
        <TituloSeccion>{t("Listas de compras")}</TituloSeccion>
        {datos.listas.length === 0 ? (
          <EstadoVacio
            icono="lista"
            titulo={t("No tienes listas todavía")}
            texto={t("Crea una lista, elige los productos de una tienda y ve marcando lo que lleves.")}
            accion={
              <Boton onClick={onCrearLista} icono="mas">
                {t("Nueva lista")}
              </Boton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {datos.listas.map((l) => {
              const tienda = datos.tiendas.find((x) => x.id === l.tiendaId);
              const total = l.items.length;
              const marcados = l.items.filter((i) => i.marcado).length;
              const color = tienda ? colorLegible(tienda.color, tema) : undefined;
              return (
                <Tarjeta key={l.id} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onAbrirLista(l.id)}
                    className="flex w-full items-start gap-3 p-4 text-left active:bg-soft/40"
                  >
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg"
                      style={color ? { backgroundColor: `${color}1f` } : undefined}
                    >
                      <span className="emoji">{tienda?.icono ?? "🛒"}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-extrabold text-tinta">{l.nombre}</span>
                      <span className="block text-[11px] font-semibold" style={{ color }}>
                        {tienda?.nombre ?? t("Tienda eliminada")}
                      </span>
                      <span className="mt-2 block">
                        <BarraProgreso
                          valor={marcados}
                          max={total || 1}
                          color={color || "rgb(var(--c-acc))"}
                          altura={8}
                        />
                      </span>
                      <span className="mt-1 block text-[10px] font-bold text-subtinta">
                        {marcados} / {total} {t("marcados")}
                      </span>
                    </span>
                    <Icono nombre="flecha" className="mt-1 h-4 w-4 shrink-0 text-subtinta" />
                  </button>
                  <div className="flex items-center justify-end gap-1.5 border-t border-borde/70 px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => onEditarLista(l.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-subtinta active:bg-soft"
                    >
                      <Icono nombre="lapiz" className="h-3.5 w-3.5" />
                      {t("Editar")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminarLista(l.id)}
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
    </div>
  );
}
