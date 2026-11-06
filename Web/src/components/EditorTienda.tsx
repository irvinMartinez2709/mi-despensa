import { useEffect, useState } from "react";
import type { Categoria, Tienda } from "../types";
import { COLORES_MARCA, ICONOS_MARCA } from "../types";
import { Boton, Campo, Hoja } from "./ui";
import { CampoMarca, CampoCategoria } from "./marcas";
import { useT } from "../i18n";

export interface BorradorTienda {
  nombre: string;
  tipoId: string;
  lugar: string;
  color: string;
  icono: string;
}

const VACIO: BorradorTienda = { nombre: "", tipoId: "", lugar: "", color: COLORES_MARCA[1], icono: ICONOS_MARCA[0] };

export function EditorTienda({
  abierta,
  onCerrar,
  tienda,
  categorias,
  onCrearCategoria,
  onGuardar,
  onEliminar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  tienda?: Tienda | null;
  categorias: Categoria[];
  onCrearCategoria: (nombre: string, itbms: boolean) => Categoria;
  onGuardar: (borrador: BorradorTienda) => void;
  onEliminar?: () => void;
}) {
  const t = useT();
  const [borrador, setBorrador] = useState<BorradorTienda>(VACIO);

  useEffect(() => {
    if (!abierta) return;
    setBorrador(
      tienda
        ? { nombre: tienda.nombre, tipoId: tienda.tipoId, lugar: tienda.lugar, color: tienda.color, icono: tienda.icono }
        : {
            ...VACIO,
            tipoId: categorias[0]?.id || "",
            color: COLORES_MARCA[Math.floor(Math.random() * COLORES_MARCA.length)],
          }
    );
  }, [abierta, tienda]);

  function guardar() {
    if (!borrador.nombre.trim()) return;
    onGuardar({ ...borrador, nombre: borrador.nombre.trim() });
    onCerrar();
  }

  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={tienda ? t("Editar tienda") : t("Nueva tienda")}
      alto
      pie={
        <div className="flex gap-2">
          {tienda && onEliminar && (
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
          placeholder={t("Ej. Supermercado El Ahorro…")}
          autoFocus
        />

        <CampoCategoria
          label={t("Tipo de tienda")}
          valor={borrador.tipoId}
          opciones={categorias}
          onChange={(id) => setBorrador((b) => ({ ...b, tipoId: id }))}
          onCrear={(nombre) => {
            const creada = onCrearCategoria(nombre, false);
            setBorrador((b) => ({ ...b, tipoId: creada.id }));
          }}
        />

        <Campo
          label={`${t("Lugar")} (${t("opcional")})`}
          value={borrador.lugar}
          onChange={(v) => setBorrador((b) => ({ ...b, lugar: v }))}
          placeholder={t("Escribe dónde está…")}
        />

        <CampoMarca
          icono={borrador.icono}
          color={borrador.color}
          onIcono={(v) => setBorrador((b) => ({ ...b, icono: v }))}
          onColor={(v) => setBorrador((b) => ({ ...b, color: v }))}
          etiqueta={t("Icono o emoji de la tienda")}
        />
      </div>
    </Hoja>
  );
}
