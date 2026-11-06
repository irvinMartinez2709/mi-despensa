import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Categoria,
  Config,
  Datos,
  ListaCompras,
  MovimientoPrecio,
  Producto,
  Tema,
  Tienda,
} from "../types";
import {
  CONFIG_DEFECTO,
  borrarTodo,
  datosEjemplo,
  datosVacios,
  guardarConfig,
  guardarDatos,
  guardarTema,
  leerConfig,
  leerDatos,
  leerTema,
  nuevoId,
} from "../lib/almacen";

export function useDatos() {
  const [datos, setDatos] = useState<Datos>(() => leerDatos());
  const [config, setConfig] = useState<Config>(() => leerConfig());
  const [tema, setTema] = useState<Tema>(() => leerTema());

  useEffect(() => {
    guardarDatos(datos);
  }, [datos]);

  useEffect(() => {
    guardarConfig(config);
  }, [config]);

  useEffect(() => {
    guardarTema(tema);
  }, [tema]);

  /* ------------------------------ categorías ------------------------------ */

  const añadirCategoria = useCallback((lista: "tiposTienda" | "tiposProducto", base: Omit<Categoria, "id" | "creada">): Categoria => {
    const categoria: Categoria = { ...base, nombre: base.nombre.trim(), id: nuevoId("cat"), creada: new Date().toISOString() };
    setDatos((d) => ({ ...d, [lista]: [categoria, ...d[lista]] }));
    return categoria;
  }, []);

  const actualizarCategoria = useCallback((lista: "tiposTienda" | "tiposProducto", id: string, cambios: Partial<Categoria>) => {
    setDatos((d) => ({
      ...d,
      [lista]: d[lista].map((c) => (c.id === id ? { ...c, ...cambios, id: c.id } : c)),
    }));
  }, []);

  /** Elimina la categoría (el uso debe revisarse antes en la UI con `datos`). */
  const eliminarCategoria = useCallback((lista: "tiposTienda" | "tiposProducto", id: string) => {
    setDatos((d) => ({ ...d, [lista]: d[lista].filter((c) => c.id !== id) }));
  }, []);

  /* -------------------------------- tiendas -------------------------------- */

  const añadirTienda = useCallback((base: Omit<Tienda, "id" | "creada">): Tienda => {
    const tienda: Tienda = { ...base, nombre: base.nombre.trim(), id: nuevoId("tie"), creada: new Date().toISOString() };
    setDatos((d) => ({ ...d, tiendas: [tienda, ...d.tiendas] }));
    return tienda;
  }, []);

  const actualizarTienda = useCallback((id: string, cambios: Partial<Tienda>) => {
    setDatos((d) => ({
      ...d,
      tiendas: d.tiendas.map((t) => (t.id === id ? { ...t, ...cambios, id: t.id } : t)),
    }));
  }, []);

  /** Elimina la tienda y todo lo dependiente (productos, precios, listas). */
  const eliminarTienda = useCallback((id: string) => {
    setDatos((d) => {
      const productos = d.productos.filter((p) => p.tiendaId !== id);
      const ids = new Set(productos.map((p) => p.id));
      return {
        ...d,
        tiendas: d.tiendas.filter((t) => t.id !== id),
        productos,
        precios: d.precios.filter((m) => ids.has(m.productoId)),
        listas: d.listas.filter((l) => l.tiendaId !== id),
      };
    });
  }, []);

  /* ------------------------------- productos ------------------------------- */

  const añadirProducto = useCallback((base: Omit<Producto, "id" | "creada" | "actualizada">): Producto => {
    const ahora = new Date().toISOString();
    const producto: Producto = { ...base, nombre: base.nombre.trim(), id: nuevoId("pro"), creada: ahora, actualizada: ahora };
    setDatos((d) => {
      const precios = [...d.precios];
      if (producto.precio !== null) {
        precios.push({ id: nuevoId("pre"), productoId: producto.id, precio: producto.precio, cambio: "creado", fecha: ahora });
      }
      return { ...d, productos: [producto, ...d.productos], precios };
    });
    return producto;
  }, []);

  /**
   * Actualiza un producto. Si el precio cambió y se indicó subida/bajada,
   * registra el movimiento en el historial.
   */
  const actualizarProducto = useCallback(
    (id: string, cambios: Partial<Producto>, cambioPrecio?: "subida" | "bajada" | "correccion") => {
      const ahora = new Date().toISOString();
      setDatos((d) => {
        const anterior = d.productos.find((p) => p.id === id);
        if (!anterior) return d;
        const precioNuevo = "precio" in cambios ? cambios.precio ?? null : anterior.precio;
        const cambioReal = precioNuevo !== anterior.precio;
        const productos = d.productos.map((p) =>
          p.id === id ? { ...p, ...cambios, id: p.id, actualizada: ahora } : p
        );
        let precios = d.precios;
        if (cambioReal && cambioPrecio && cambioPrecio !== "correccion" && precioNuevo !== null) {
          precios = [
            ...d.precios,
            { id: nuevoId("pre"), productoId: id, precio: precioNuevo, cambio: cambioPrecio, fecha: ahora } as MovimientoPrecio,
          ];
        }
        return { ...d, productos, precios };
      });
    },
    []
  );

  const eliminarProducto = useCallback((id: string) => {
    setDatos((d) => ({
      ...d,
      productos: d.productos.filter((p) => p.id !== id),
      precios: d.precios.filter((m) => m.productoId !== id),
      listas: d.listas.map((l) => ({ ...l, items: l.items.filter((i) => i.productoId !== id) })),
    }));
  }, []);

  /* ------------------------------- listas -------------------------------- */

  const añadirLista = useCallback((base: Omit<ListaCompras, "id" | "creada" | "actualizada">): ListaCompras => {
    const ahora = new Date().toISOString();
    const lista: ListaCompras = { ...base, nombre: base.nombre.trim(), id: nuevoId("lis"), creada: ahora, actualizada: ahora };
    setDatos((d) => ({ ...d, listas: [lista, ...d.listas] }));
    return lista;
  }, []);

  const actualizarLista = useCallback((id: string, cambios: Partial<ListaCompras>) => {
    setDatos((d) => ({
      ...d,
      listas: d.listas.map((l) => (l.id === id ? { ...l, ...cambios, id: l.id, actualizada: new Date().toISOString() } : l)),
    }));
  }, []);

  const eliminarLista = useCallback((id: string) => {
    setDatos((d) => ({ ...d, listas: d.listas.filter((l) => l.id !== id) }));
  }, []);

  /* -------------------------------- varios -------------------------------- */

  const actualizarConfig = useCallback((cambios: Partial<Config>) => {
    setConfig((c) => ({ ...c, ...cambios }));
  }, []);

  const cambiarTema = useCallback(() => {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const restablecer = useCallback(() => {
    setDatos(datosVacios());
    setConfig({ ...CONFIG_DEFECTO });
  }, []);

  const cargarEjemplo = useCallback(() => {
    const ejemplo = datosEjemplo();
    setDatos((d) => ({
      tiposTienda: [...d.tiposTienda, ...ejemplo.tiposTienda],
      tiposProducto: [...d.tiposProducto, ...ejemplo.tiposProducto],
      tiendas: [...d.tiendas, ...ejemplo.tiendas],
      productos: [...d.productos, ...ejemplo.productos],
      precios: [...d.precios, ...ejemplo.precios],
      listas: [...d.listas, ...ejemplo.listas],
    }));
  }, []);

  const reemplazarTodo = useCallback((nuevo: Datos, configNueva?: Partial<Config>, temaNuevo?: Tema) => {
    setDatos(nuevo);
    if (configNueva) setConfig((c) => ({ ...c, ...configNueva }));
    if (temaNuevo) setTema(temaNuevo);
  }, []);

  return useMemo(
    () => ({
      datos,
      config,
      tema,
      añadirCategoria,
      actualizarCategoria,
      eliminarCategoria,
      añadirTienda,
      actualizarTienda,
      eliminarTienda,
      añadirProducto,
      actualizarProducto,
      eliminarProducto,
      añadirLista,
      actualizarLista,
      eliminarLista,
      actualizarConfig,
      cambiarTema,
      restablecer,
      cargarEjemplo,
      reemplazarTodo,
      borrarTodo,
    }),
    [
      datos,
      config,
      tema,
      añadirCategoria,
      actualizarCategoria,
      eliminarCategoria,
      añadirTienda,
      actualizarTienda,
      eliminarTienda,
      añadirProducto,
      actualizarProducto,
      eliminarProducto,
      añadirLista,
      actualizarLista,
      eliminarLista,
      actualizarConfig,
      cambiarTema,
      restablecer,
      cargarEjemplo,
      reemplazarTodo,
    ]
  );
}

export type ApiDatos = ReturnType<typeof useDatos>;
