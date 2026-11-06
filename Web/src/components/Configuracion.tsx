import { useRef, useState, type ChangeEvent } from "react";
import type { Categoria, Config, Datos, Tema } from "../types";
import { COLOR_PRESETS } from "../types";
import { Boton, Interruptor, Segmentado, Tarjeta, TituloSeccion } from "./ui";
import { CampoMarca } from "./marcas";
import { Icono } from "./iconos";
import { useT } from "../i18n";
import { Hoja, Campo, avisar, confirmar } from "./ui";
import { VERSION, VERSION_CODE, NOMBRE_APP } from "../version";

type ListaCat = "tiposTienda" | "tiposProducto";

interface BorradorCat {
  id: string | null;
  nombre: string;
  color: string;
  icono: string;
  itbms: boolean;
}

const CAT_VACIA: BorradorCat = { id: null, nombre: "", color: "#12A365", icono: "📦", itbms: false };

export default function Configuracion({
  datos,
  config,
  tema,
  onConfig,
  onTema,
  onExportar,
  onImportar,
  onBorrarTodo,
  onCargarEjemplo,
  onAyuda,
  onAcerca,
  onCrearCategoria,
  onActualizarCategoria,
  onEliminarCategoria,
  onVolver,
}: {
  datos: Datos;
  config: Config;
  tema: Tema;
  onConfig: (c: Partial<Config>) => void;
  onTema: () => void;
  onExportar: () => void;
  onImportar: (texto: string) => void;
  onBorrarTodo: () => void;
  onCargarEjemplo: () => void;
  onAyuda: () => void;
  onAcerca: () => void;
  onCrearCategoria: (lista: ListaCat, nombre: string, itbms: boolean) => void;
  onActualizarCategoria: (lista: ListaCat, id: string, cambios: Partial<Categoria>) => void;
  onEliminarCategoria: (lista: ListaCat, id: string) => void;
  onVolver: () => void;
}) {
  const t = useT();
  const [editorCat, setEditorCat] = useState<{ abierta: boolean; lista: ListaCat; borrador: BorradorCat }>({
    abierta: false,
    lista: "tiposTienda",
    borrador: CAT_VACIA,
  });
  const archivoRef = useRef<HTMLInputElement>(null);

  function abrirAlta(lista: ListaCat) {
    setEditorCat({
      abierta: true,
      lista,
      borrador: { ...CAT_VACIA, icono: lista === "tiposTienda" ? "🛒" : "📦", color: lista === "tiposTienda" ? "#123C63" : "#12A365" },
    });
  }

  function abrirEdicion(lista: ListaCat, c: Categoria) {
    setEditorCat({ abierta: true, lista, borrador: { id: c.id, nombre: c.nombre, color: c.color, icono: c.icono, itbms: c.itbms } });
  }

  function guardarCategoria() {
    const nombre = editorCat.borrador.nombre.trim();
    if (!nombre) return;
    if (editorCat.borrador.id) {
      onActualizarCategoria(editorCat.lista, editorCat.borrador.id, {
        nombre,
        color: editorCat.borrador.color,
        icono: editorCat.borrador.icono,
        itbms: editorCat.lista === "tiposProducto" ? editorCat.borrador.itbms : false,
      });
      avisar(t("Categoría actualizada"));
    } else {
      onCrearCategoria(editorCat.lista, nombre, editorCat.lista === "tiposProducto" ? editorCat.borrador.itbms : false);
      avisar(t("Categoría creada"));
    }
    setEditorCat((e) => ({ ...e, abierta: false }));
  }

  async function borrarCategoria(lista: ListaCat, c: Categoria) {
    const enUso =
      lista === "tiposTienda"
        ? datos.tiendas.filter((x) => x.tipoId === c.id).length
        : datos.productos.filter((x) => x.tipoId === c.id).length;
    const ok = await confirmar({
      titulo: t("¿Eliminar categoría?"),
      mensaje: enUso
        ? t("Hay {n} elementos usándola. Se les quitará la categoría.").replace("{n}", String(enUso))
        : t("Esta acción no se puede deshacer."),
      textoOk: t("Eliminar"),
      peligro: true,
    });
    if (!ok) return;
    onEliminarCategoria(lista, c.id);
    avisar(t("Categoría eliminada"));
  }

  function elegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => onImportar(String(lector.result || ""));
    lector.onerror = () => avisar(t("No se pudo leer el archivo"), "error");
    lector.readAsText(archivo);
  }

  const bloques: { lista: ListaCat; titulo: string; categorias: Categoria[]; uso: (c: Categoria) => number }[] = [
    { lista: "tiposTienda", titulo: t("Tipos de tienda"), categorias: datos.tiposTienda, uso: (c) => datos.tiendas.filter((x) => x.tipoId === c.id).length },
    { lista: "tiposProducto", titulo: t("Tipos de producto"), categorias: datos.tiposProducto, uso: (c) => datos.productos.filter((x) => x.tipoId === c.id).length },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <header className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onVolver}
          aria-label={t("Volver")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-borde bg-card text-subtinta active:scale-95"
        >
          <Icono nombre="atras" className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-black leading-tight text-tinta">{t("Ajustes")}</h1>
          <p className="text-xs font-medium text-subtinta">{NOMBRE_APP} · v{VERSION}</p>
        </div>
      </header>

      {/* ------------------------------ Apariencia ------------------------------ */}
      <section>
        <TituloSeccion>{t("Apariencia")}</TituloSeccion>
        <Tarjeta className="space-y-4 p-4">
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-tinta">{t("Tema")}</span>
            <Segmentado
              valor={tema}
              onChange={() => onTema()}
              opciones={[
                { id: "light", texto: `☀️ ${t("Claro")}` },
                { id: "dark", texto: `🌙 ${t("Oscuro")}` },
              ]}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-tinta">{t("Color de la app")}</span>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onConfig({ color: p.id })}
                  title={p.nombre}
                  aria-label={p.nombre}
                  className={`h-9 w-9 rounded-full border-[3px] transition active:scale-90 ${
                    config.color === p.id ? "border-tinta" : "border-transparent"
                  }`}
                  style={{ backgroundColor: tema === "dark" ? p.dark : p.light }}
                />
              ))}
              <label
                className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border-[3px] border-dashed border-borde text-[10px] font-bold text-subtinta"
                title={t("Color personalizado")}
              >
                +
                <input
                  type="color"
                  value={config.color.startsWith("#") ? config.color : "#123C63"}
                  onChange={(e) => onConfig({ color: e.target.value })}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-tinta">{t("Apariencia de los emojis")}</span>
            <Segmentado
              valor={config.emojis}
              onChange={(v) => onConfig({ emojis: v })}
              opciones={[
                { id: "color", texto: t("A color") },
                { id: "mono", texto: t("Monocromo") },
                { id: "ninguno", texto: t("Ocultos") },
              ]}
            />
          </div>
        </Tarjeta>
      </section>

      {/* ---------------------------- Categorías ---------------------------- */}
      <section>
        <TituloSeccion>{t("Categorías")}</TituloSeccion>
        <div className="space-y-3">
          {bloques.map((b) => (
            <Tarjeta key={b.lista} className="overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="text-sm font-extrabold text-tinta">{b.titulo}</span>
                <button
                  type="button"
                  onClick={() => abrirAlta(b.lista)}
                  className="inline-flex items-center gap-1 rounded-lg bg-acc-suave px-2.5 py-1.5 text-[11px] font-black text-acc active:scale-95"
                >
                  <Icono nombre="mas" className="h-3.5 w-3.5" />
                  {t("Añadir")}
                </button>
              </div>
              <div className="divide-y divide-borde/70 px-4 pb-2">
                {b.categorias.length === 0 && (
                  <p className="py-4 text-center text-[12px] text-subtinta">{t("Sin categorías todavía.")}</p>
                )}
                {b.categorias.map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5 py-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base" style={{ backgroundColor: `${c.color}1f` }}>
                      <span className="emoji">{c.icono}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-tinta">{c.nombre}</span>
                      <span className="block text-[10px] font-semibold text-subtinta">
                        {b.uso(c)} {b.lista === "tiposTienda" ? t("tiendas") : t("productos")}
                        {b.lista === "tiposProducto" && c.itbms && " · ITBMS 7%"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => abrirEdicion(b.lista, c)}
                      aria-label={t("Editar")}
                      className="grid h-8 w-8 place-items-center rounded-lg text-subtinta active:bg-soft"
                    >
                      <Icono nombre="lapiz" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void borrarCategoria(b.lista, c)}
                      aria-label={t("Eliminar")}
                      className="grid h-8 w-8 place-items-center rounded-lg text-red-500 active:bg-red-500/10"
                    >
                      <Icono nombre="basura" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Tarjeta>
          ))}
        </div>
      </section>

      {/* --------------------------- Datos y respaldo --------------------------- */}
      <section>
        <TituloSeccion>{t("Datos y respaldo")}</TituloSeccion>
        <Tarjeta className="divide-y divide-borde/70 px-4">
          <button type="button" onClick={onExportar} className="flex w-full items-center gap-3 py-3.5 text-left active:bg-soft/40">
            <Icono nombre="descargar" className="h-5 w-5 text-acc" />
            <span className="flex-1">
              <span className="block text-sm font-bold text-tinta">{t("Exportar datos")}</span>
              <span className="block text-[11px] text-subtinta">{t("Guarda todo en un archivo JSON.")}</span>
            </span>
          </button>
          <button type="button" onClick={() => archivoRef.current?.click()} className="flex w-full items-center gap-3 py-3.5 text-left active:bg-soft/40">
            <Icono nombre="subir" className="h-5 w-5 text-acc" />
            <span className="flex-1">
              <span className="block text-sm font-bold text-tinta">{t("Importar datos")}</span>
              <span className="block text-[11px] text-subtinta">{t("Restaura un respaldo JSON.")}</span>
            </span>
          </button>
          <input ref={archivoRef} type="file" accept="application/json,.json" onChange={elegirArchivo} className="hidden" />
          <button type="button" onClick={onCargarEjemplo} className="flex w-full items-center gap-3 py-3.5 text-left active:bg-soft/40">
            <Icono nombre="lista" className="h-5 w-5 text-acc" />
            <span className="flex-1">
              <span className="block text-sm font-bold text-tinta">{t("Cargar datos de ejemplo")}</span>
              <span className="block text-[11px] text-subtinta">{t("Agrega tiendas y productos de prueba.")}</span>
            </span>
          </button>
          <button type="button" onClick={onBorrarTodo} className="flex w-full items-center gap-3 py-3.5 text-left active:bg-soft/40">
            <Icono nombre="basura" className="h-5 w-5 text-red-500" />
            <span className="flex-1">
              <span className="block text-sm font-bold text-red-500">{t("Borrar todo")}</span>
              <span className="block text-[11px] text-subtinta">{t("Elimina todas las tiendas, productos y listas.")}</span>
            </span>
          </button>
        </Tarjeta>
      </section>

      {/* ----------------------------- Información ----------------------------- */}
      <section>
        <TituloSeccion>{t("Información")}</TituloSeccion>
        <Tarjeta className="divide-y divide-borde/70 px-4">
          <button type="button" onClick={onAyuda} className="flex w-full items-center gap-3 py-3.5 text-left active:bg-soft/40">
            <Icono nombre="ayuda" className="h-5 w-5 text-acc" />
            <span className="flex-1 text-sm font-bold text-tinta">{t("Ayuda")}</span>
            <Icono nombre="flecha" className="h-4 w-4 text-subtinta" />
          </button>
          <button type="button" onClick={onAcerca} className="flex w-full items-center gap-3 py-3.5 text-left active:bg-soft/40">
            <Icono nombre="info" className="h-5 w-5 text-acc" />
            <span className="flex-1 text-sm font-bold text-tinta">{t("Acerca de")}</span>
            <Icono nombre="flecha" className="h-4 w-4 text-subtinta" />
          </button>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm font-bold text-tinta">{t("Versión")}</span>
            <span className="text-sm font-black text-subtinta">
              {VERSION} ({VERSION_CODE})
            </span>
          </div>
        </Tarjeta>
      </section>

      <div className="pb-2 text-center">
        <Interruptor
          activo={config.confirmarSalida}
          onChange={(v) => onConfig({ confirmarSalida: v })}
          label={t("Confirmar al salir")}
          detalle={t("Pide doble pulsación para cerrar la app en Android.")}
        />
      </div>

      {/* --------------------- Editor de categoría (hoja) --------------------- */}
      <Hoja
        abierta={editorCat.abierta}
        onCerrar={() => setEditorCat((e) => ({ ...e, abierta: false }))}
        titulo={editorCat.borrador.id ? t("Editar categoría") : t("Nueva categoría")}
        pie={
          <div className="flex gap-2">
            <Boton variante="contorno" className="flex-1" onClick={() => setEditorCat((e) => ({ ...e, abierta: false }))}>
              {t("Cancelar")}
            </Boton>
            <Boton className="flex-1" onClick={guardarCategoria} disabled={!editorCat.borrador.nombre.trim()}>
              {t("Guardar")}
            </Boton>
          </div>
        }
      >
        <div className="space-y-4">
          <Campo
            label={t("Nombre")}
            value={editorCat.borrador.nombre}
            onChange={(v) => setEditorCat((e) => ({ ...e, borrador: { ...e.borrador, nombre: v } }))}
            placeholder={t("Ej. Supermercado, Bebidas…")}
            autoFocus
          />
          {editorCat.lista === "tiposProducto" && (
            <div className="rounded-2xl border-2 border-borde bg-soft px-4 py-2">
              <Interruptor
                activo={editorCat.borrador.itbms}
                onChange={(v) => setEditorCat((e) => ({ ...e, borrador: { ...e.borrador, itbms: v } }))}
                label="Cobra ITBMS (7%)"
                detalle="Al cotizar se les agregará el 7% a sus productos."
              />
            </div>
          )}
          <CampoMarca
            icono={editorCat.borrador.icono}
            color={editorCat.borrador.color}
            onIcono={(v) => setEditorCat((e) => ({ ...e, borrador: { ...e.borrador, icono: v } }))}
            onColor={(v) => setEditorCat((e) => ({ ...e, borrador: { ...e.borrador, color: v } }))}
            etiqueta={t("Marca")}
          />
          <span className="grid h-9 place-items-center rounded-full px-3 text-sm font-bold" style={{ backgroundColor: `${editorCat.borrador.color}1f`, color: editorCat.borrador.color }}>
            <span className="emoji mr-1">{editorCat.borrador.icono}</span>
            {editorCat.borrador.nombre || t("Nombre")}
          </span>
        </div>
      </Hoja>
    </div>
  );
}
