import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as AppPlugin } from "@capacitor/app";

import { useDatos } from "./hooks/useDatos";
import { CtxIdioma, useT } from "./i18n";
import { aplicarPaleta, acentoDe, mezclarHex } from "./lib/colores";
import { construirRespaldo, guardarRespaldo, importarRespaldo } from "./lib/respaldo";
import { COLORES_MARCA, ICONOS_MARCA } from "./types";

import Splash from "./components/Splash";
import Tiendas from "./components/Tiendas";
import Crear from "./components/Crear";
import Productos from "./components/Productos";
import Cotizar from "./components/Cotizar";
import Historial from "./components/Historial";
import Configuracion from "./components/Configuracion";
import Ayuda from "./components/Ayuda";
import Acerca from "./components/Acerca";
import { Dialogos, avisar, confirmar } from "./components/ui";
import { Icono, type NombreIcono } from "./components/iconos";
import { EditorTienda, type BorradorTienda } from "./components/EditorTienda";
import { EditorProducto, type BorradorProducto, type CambioPrecio } from "./components/EditorProducto";
import { EditorLista, VistaLista, ListaImpresion, type BorradorLista } from "./components/EditorLista";

type Seccion = "tiendas" | "crear" | "buscar" | "cotizar" | "historial" | "ajustes" | "ayuda" | "acerca";
type ListaCat = "tiposTienda" | "tiposProducto";

export default function App() {
  const api = useDatos();
  const { datos, config, tema } = api;
  const t = useT();

  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState<Seccion>("tiendas");
  const [tiendaAbierta, setTiendaAbierta] = useState<string | null>(null);

  const [editorTienda, setEditorTienda] = useState<{ abierta: boolean; id: string | null }>({ abierta: false, id: null });
  const [editorProducto, setEditorProducto] = useState<{ abierta: boolean; id: string | null; fija: string | null }>({
    abierta: false,
    id: null,
    fija: null,
  });
  const [editorLista, setEditorLista] = useState<{ abierta: boolean; id: string | null }>({ abierta: false, id: null });
  const [listaAbierta, setListaAbierta] = useState<string | null>(null);

  const ultimoBack = useRef(0);
  const [avisoBack, setAvisoBack] = useState(false);

  /* Tema + paleta */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", tema === "dark");
    html.classList.toggle("light", tema === "light");
    html.setAttribute("data-color", config.color);
    html.setAttribute("data-emojis", config.emojis);
    aplicarPaleta(config, tema);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", acentoDe(config.color, tema));
  }, [tema, config]);

  /* Botón atrás de Android: cierra lo abierto, luego doble pulsación para salir */
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handle = AppPlugin.addListener("backButton", () => {
      if (editorTienda.abierta || editorProducto.abierta || editorLista.abierta) {
        setEditorTienda({ abierta: false, id: null });
        setEditorProducto({ abierta: false, id: null, fija: null });
        setEditorLista({ abierta: false, id: null });
        return;
      }
      if (listaAbierta) {
        setListaAbierta(null);
        return;
      }
      if (tiendaAbierta) {
        if (seccion !== "buscar") setSeccion("buscar");
        else {
          setTiendaAbierta(null);
          setSeccion("tiendas");
        }
        return;
      }
      if (seccion === "ayuda" || seccion === "acerca") {
        setSeccion("ajustes");
        return;
      }
      if (seccion !== "tiendas") {
        setSeccion("tiendas");
        return;
      }
      if (!config.confirmarSalida) {
        void AppPlugin.exitApp();
        return;
      }
      const ahora = Date.now();
      if (ahora - ultimoBack.current < 2000) {
        void AppPlugin.exitApp();
      } else {
        ultimoBack.current = ahora;
        setAvisoBack(true);
        window.setTimeout(() => setAvisoBack(false), 2000);
      }
    });
    return () => {
      void handle.then((l) => l.remove());
    };
  }, [
    tiendaAbierta,
    seccion,
    listaAbierta,
    config.confirmarSalida,
    editorTienda.abierta,
    editorProducto.abierta,
    editorLista.abierta,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [seccion, tiendaAbierta]);

  const tiendaActual = useMemo(
    () => datos.tiendas.find((x) => x.id === tiendaAbierta) || null,
    [datos.tiendas, tiendaAbierta]
  );
  const tiendaEnEdicion = useMemo(
    () => datos.tiendas.find((x) => x.id === editorTienda.id) || null,
    [datos.tiendas, editorTienda.id]
  );
  const productoEnEdicion = useMemo(
    () => datos.productos.find((x) => x.id === editorProducto.id) || null,
    [datos.productos, editorProducto.id]
  );
  const listaEnEdicion = useMemo(
    () => datos.listas.find((x) => x.id === editorLista.id) || null,
    [datos.listas, editorLista.id]
  );
  const listaVisible = useMemo(
    () => datos.listas.find((x) => x.id === listaAbierta) || null,
    [datos.listas, listaAbierta]
  );

  /* ------------------------------ tiendas ------------------------------ */

  function guardarTienda(borrador: BorradorTienda) {
    if (editorTienda.id) {
      api.actualizarTienda(editorTienda.id, borrador);
      avisar(t("Tienda actualizada"));
    } else {
      const creada = api.añadirTienda(borrador);
      avisar(t("Tienda creada"));
      setTiendaAbierta(creada.id);
      setSeccion("buscar");
    }
  }

  async function eliminarTienda(id: string) {
    const tienda = datos.tiendas.find((x) => x.id === id);
    if (!tienda) return;
    const nProd = datos.productos.filter((p) => p.tiendaId === id).length;
    const nListas = datos.listas.filter((l) => l.tiendaId === id).length;
    const ok = await confirmar({
      titulo: t("¿Eliminar tienda?"),
      mensaje: t("Se borrarán sus {p} productos y {l} listas. Esta acción no se puede deshacer.", {
        p: nProd,
        l: nListas,
      }),
      textoOk: t("Eliminar"),
      peligro: true,
    });
    if (!ok) return;
    api.eliminarTienda(id);
    if (tiendaAbierta === id) {
      setTiendaAbierta(null);
      setSeccion("tiendas");
    }
    avisar(t("Tienda eliminada"));
  }

  /* ----------------------------- productos ----------------------------- */

  function guardarProducto(borrador: BorradorProducto, cambio?: CambioPrecio) {
    if (editorProducto.id) {
      api.actualizarProducto(editorProducto.id, borrador, cambio);
      if (cambio === "subida" || cambio === "bajada") avisar(t("Precio actualizado y guardado en el historial"));
      else avisar(t("Producto actualizado"));
    } else {
      api.añadirProducto(borrador);
      avisar(t("Producto creado"));
    }
  }

  async function eliminarProducto(id: string) {
    const producto = datos.productos.find((x) => x.id === id);
    if (!producto) return;
    const ok = await confirmar({
      titulo: t("¿Eliminar producto?"),
      mensaje: t("Se borrará también su historial de precios. Esta acción no se puede deshacer."),
      textoOk: t("Eliminar"),
      peligro: true,
    });
    if (!ok) return;
    api.eliminarProducto(id);
    avisar(t("Producto eliminado"));
  }

  /* ------------------------------- listas ------------------------------- */

  function guardarLista(borrador: BorradorLista) {
    if (editorLista.id) {
      api.actualizarLista(editorLista.id, borrador);
      avisar(t("Lista actualizada"));
    } else {
      const creada = api.añadirLista(borrador);
      avisar(t("Lista creada"));
      setListaAbierta(creada.id);
    }
  }

  async function eliminarLista(id: string) {
    const ok = await confirmar({
      titulo: t("¿Eliminar lista?"),
      mensaje: t("Esta acción no se puede deshacer."),
      textoOk: t("Eliminar"),
      peligro: true,
    });
    if (!ok) return;
    api.eliminarLista(id);
    if (listaAbierta === id) setListaAbierta(null);
    avisar(t("Lista eliminada"));
  }

  function alternarItemLista(productoId: string) {
    if (!listaVisible) return;
    const items = listaVisible.items.map((i) =>
      i.productoId === productoId ? { ...i, marcado: !i.marcado } : i
    );
    api.actualizarLista(listaVisible.id, { items });
  }

  function marcarTodaLista(marcar: boolean) {
    if (!listaVisible) return;
    api.actualizarLista(listaVisible.id, { items: listaVisible.items.map((i) => ({ ...i, marcado: marcar })) });
  }

  /* ----------------------------- categorías ----------------------------- */

  function crearCategoria(lista: ListaCat, nombre: string, itbms: boolean) {
    return api.añadirCategoria(lista, {
      nombre,
      itbms: lista === "tiposProducto" ? itbms : false,
      color: COLORES_MARCA[Math.floor(Math.random() * COLORES_MARCA.length)],
      icono: ICONOS_MARCA[Math.floor(Math.random() * ICONOS_MARCA.length)],
    });
  }

  function eliminarCategoria(lista: ListaCat, id: string) {
    api.eliminarCategoria(lista, id);
    if (lista === "tiposTienda") {
      datos.tiendas.filter((x) => x.tipoId === id).forEach((x) => api.actualizarTienda(x.id, { tipoId: "" }));
    } else {
      datos.productos.filter((x) => x.tipoId === id).forEach((x) => api.actualizarProducto(x.id, { tipoId: "" }));
    }
  }

  /* ------------------------------- respaldo ------------------------------ */

  async function exportar() {
    try {
      const texto = construirRespaldo(datos, config, tema);
      const fecha = new Date().toISOString().slice(0, 10);
      const resultado = await guardarRespaldo(`mi-despensa-respaldo-${fecha}.json`, texto);
      if (resultado === "compartido") avisar(t("Respaldo guardado"));
      else if (resultado === "descargado") avisar(t("Respaldo descargado"));
    } catch {
      avisar(t("No se pudo exportar el respaldo"), "error");
    }
  }

  async function importar(texto: string) {
    const ok = await confirmar({
      titulo: t("¿Importar respaldo?"),
      mensaje: t("Los datos actuales se reemplazarán por los del archivo."),
      textoOk: t("Importar"),
    });
    if (!ok) return;
    const resultado = importarRespaldo(texto);
    if (!resultado.ok || !resultado.datos) {
      avisar(resultado.mensaje || t("No se pudo importar"), "error");
      return;
    }
    api.reemplazarTodo(resultado.datos, resultado.config, resultado.tema);
    setTiendaAbierta(null);
    setListaAbierta(null);
    setSeccion("tiendas");
    avisar(t("Respaldo importado"));
  }

  async function borrarTodo() {
    const ok = await confirmar({
      titulo: t("¿Borrar todos los datos?"),
      mensaje: t("Se eliminarán todas las tiendas, productos, precios y listas. Esta acción no se puede deshacer."),
      textoOk: t("Borrar todo"),
      peligro: true,
    });
    if (!ok) return;
    api.restablecer();
    setTiendaAbierta(null);
    setListaAbierta(null);
    setSeccion("tiendas");
    avisar(t("Datos borrados"));
  }

  async function cargarEjemplo() {
    const ok = await confirmar({
      titulo: t("¿Cargar datos de ejemplo?"),
      mensaje: t("Se agregarán tiendas, productos y una lista de prueba."),
      textoOk: t("Agregar"),
    });
    if (!ok) return;
    api.cargarEjemplo();
    avisar(t("Ejemplo agregado"));
  }

  /* ------------------------------ navegación ----------------------------- */

  const enTienda = !!tiendaAbierta && !!tiendaActual;

  const nav: { id: Seccion; label: string; icono: NombreIcono }[] = enTienda
    ? [
        { id: "buscar", label: t("Buscar"), icono: "buscar" },
        { id: "cotizar", label: t("Cotizar"), icono: "recibo" },
        { id: "historial", label: t("Historial"), icono: "reloj" },
      ]
    : [
        { id: "tiendas", label: t("Tiendas"), icono: "tienda" },
        { id: "crear", label: t("Crear"), icono: "mas" },
        { id: "buscar", label: t("Buscar"), icono: "buscar" },
        { id: "cotizar", label: t("Cotizar"), icono: "recibo" },
      ];

  const enAjustes = !enTienda && (seccion === "ajustes" || seccion === "ayuda" || seccion === "acerca");

  return (
    <CtxIdioma.Provider value="es">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
        {cargando && (
          <Splash
            tono={mezclarHex(acentoDe(config.color, tema), "#0A1220", 0.45)}
            onDone={() => setCargando(false)}
          />
        )}

        {enTienda && (
          <div className="sticky top-0 z-30 border-b-2 border-borde bg-card/95 px-4 py-2.5 backdrop-blur">
            <button
              type="button"
              onClick={() => {
                setTiendaAbierta(null);
                setSeccion("tiendas");
              }}
              className="flex items-center gap-2 rounded-xl border-2 border-borde bg-soft px-3 py-2 text-[13px] font-black text-tinta transition active:scale-95"
            >
              <Icono nombre="atras" className="h-4 w-4" />
              {t("Salir de")} {tiendaActual.nombre}
            </button>
          </div>
        )}

        <main className="flex-1 px-4 pb-24 pt-3">
          {seccion === "tiendas" && !enTienda && (
            <Tiendas
              datos={datos}
              tema={tema}
              onAbrirTienda={(id) => {
                setTiendaAbierta(id);
                setSeccion("buscar");
              }}
              onNuevaTienda={() => setEditorTienda({ abierta: true, id: null })}
              onEditarTienda={(id) => setEditorTienda({ abierta: true, id })}
              onEliminarTienda={(id) => void eliminarTienda(id)}
              onAjustes={() => setSeccion("ajustes")}
            />
          )}

          {seccion === "crear" && !enTienda && (
            <Crear
              datos={datos}
              tema={tema}
              onCrearTienda={() => setEditorTienda({ abierta: true, id: null })}
              onCrearProducto={() => setEditorProducto({ abierta: true, id: null, fija: null })}
              onCrearLista={() => setEditorLista({ abierta: true, id: null })}
              onAbrirLista={(id) => setListaAbierta(id)}
              onEditarLista={(id) => setEditorLista({ abierta: true, id })}
              onEliminarLista={(id) => void eliminarLista(id)}
            />
          )}

          {seccion === "buscar" && (
            <Productos
              datos={datos}
              tema={tema}
              tiendaFija={tiendaAbierta}
              onEditarProducto={(id) => setEditorProducto({ abierta: true, id, fija: tiendaAbierta })}
              onEliminarProducto={(id) => void eliminarProducto(id)}
              onNuevoProducto={() => setEditorProducto({ abierta: true, id: null, fija: tiendaAbierta })}
            />
          )}

          {seccion === "cotizar" && <Cotizar datos={datos} tiendaFija={tiendaAbierta} />}

          {seccion === "historial" && enTienda && (
            <Historial datos={datos} tema={tema} tiendaFija={tiendaAbierta} />
          )}

          {seccion === "ajustes" && !enTienda && (
            <Configuracion
              datos={datos}
              config={config}
              tema={tema}
              onConfig={api.actualizarConfig}
              onTema={api.cambiarTema}
              onExportar={() => void exportar()}
              onImportar={(texto) => void importar(texto)}
              onBorrarTodo={() => void borrarTodo()}
              onCargarEjemplo={() => void cargarEjemplo()}
              onAyuda={() => setSeccion("ayuda")}
              onAcerca={() => setSeccion("acerca")}
              onCrearCategoria={crearCategoria}
              onActualizarCategoria={api.actualizarCategoria}
              onEliminarCategoria={eliminarCategoria}
              onVolver={() => setSeccion("tiendas")}
            />
          )}

          {seccion === "ayuda" && !enTienda && <Ayuda onVolver={() => setSeccion("ajustes")} />}
          {seccion === "acerca" && !enTienda && <Acerca onVolver={() => setSeccion("ajustes")} />}
        </main>

        {avisoBack && (
          <div className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4">
            <div className="rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              {t("Pulsa atrás otra vez para salir")}
            </div>
          </div>
        )}

        {!enAjustes && (
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-borde bg-card/95 backdrop-blur">
            <div className="mx-auto flex max-w-2xl items-stretch">
              {nav.map((n) => {
                const activo = seccion === n.id;
                return (
                  <button
                    key={`${enTienda ? "tie" : "main"}-${n.id}`}
                    type="button"
                    onClick={() => setSeccion(n.id)}
                    className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold transition ${
                      activo ? "text-acc" : "text-subtinta"
                    }`}
                  >
                    <Icono nombre={n.icono} className="h-5 w-5" grosor={activo ? 2.2 : 1.7} />
                    {n.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <EditorTienda
          abierta={editorTienda.abierta}
          tienda={tiendaEnEdicion}
          categorias={datos.tiposTienda}
          onCerrar={() => setEditorTienda({ abierta: false, id: null })}
          onCrearCategoria={(nombre, itbms) => crearCategoria("tiposTienda", nombre, itbms)}
          onGuardar={guardarTienda}
          onEliminar={
            tiendaEnEdicion
              ? () => {
                  const id = tiendaEnEdicion.id;
                  setEditorTienda({ abierta: false, id: null });
                  void eliminarTienda(id);
                }
              : undefined
          }
        />

        <EditorProducto
          abierta={editorProducto.abierta}
          producto={productoEnEdicion}
          tiendas={datos.tiendas}
          categorias={datos.tiposProducto}
          tiendaFija={editorProducto.fija}
          onCerrar={() => setEditorProducto({ abierta: false, id: null, fija: null })}
          onCrearCategoria={(nombre, itbms) => crearCategoria("tiposProducto", nombre, itbms)}
          onGuardar={guardarProducto}
          onEliminar={
            productoEnEdicion
              ? () => {
                  const id = productoEnEdicion.id;
                  setEditorProducto({ abierta: false, id: null, fija: null });
                  void eliminarProducto(id);
                }
              : undefined
          }
        />

        <EditorLista
          abierta={editorLista.abierta}
          lista={listaEnEdicion}
          tiendas={datos.tiendas}
          productos={datos.productos}
          onCerrar={() => setEditorLista({ abierta: false, id: null })}
          onGuardar={guardarLista}
          onEliminar={
            listaEnEdicion
              ? () => {
                  const id = listaEnEdicion.id;
                  setEditorLista({ abierta: false, id: null });
                  void eliminarLista(id);
                }
              : undefined
          }
        />

        <VistaLista
          abierta={!!listaAbierta}
          lista={listaVisible}
          productos={datos.productos}
          tienda={listaVisible ? datos.tiendas.find((x) => x.id === listaVisible.tiendaId) : undefined}
          onCerrar={() => setListaAbierta(null)}
          onToggle={alternarItemLista}
          onMarcarTodo={marcarTodaLista}
          onEditar={() => {
            if (!listaVisible) return;
            const id = listaVisible.id;
            setListaAbierta(null);
            setEditorLista({ abierta: true, id });
          }}
        />

        <ListaImpresion
          lista={listaVisible}
          productos={datos.productos}
          tienda={
            listaVisible ? datos.tiendas.find((x) => x.id === listaVisible.tiendaId) : undefined
          }
        />

        <Dialogos />
      </div>
    </CtxIdioma.Provider>
  );
}
