import { useState } from "react";
import type { Categoria } from "../types";
import { COLORES_MARCA, ICONOS_MARCA } from "../types";
import { Boton, Campo, Hoja, Interruptor } from "./ui";
import { Icono } from "./iconos";
import { useT } from "../i18n";

/* ---------------------------------------------------------------- */
/* Marca: icono de la lista desplegable o emoji del teclado, + color  */
/* ---------------------------------------------------------------- */

export function CampoMarca({
  icono,
  color,
  onIcono,
  onColor,
  etiqueta,
}: {
  icono: string;
  color: string;
  onIcono: (v: string) => void;
  onColor: (v: string) => void;
  etiqueta?: string;
}) {
  const t = useT();
  const [modo, setModo] = useState<"lista" | "teclado">(
    ICONOS_MARCA.includes(icono) || !icono ? "lista" : "teclado"
  );

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1 block text-sm font-semibold text-subtinta">
          {etiqueta || t("Marca")}
        </span>
        <div className="flex rounded-2xl border-2 border-borde bg-soft p-1">
          {(["lista", "teclado"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setModo(m);
                if (m === "lista" && !ICONOS_MARCA.includes(icono)) onIcono(ICONOS_MARCA[0]);
              }}
              className={`flex-1 rounded-xl px-2 py-2 text-[13px] font-bold transition ${
                modo === m ? "bg-card text-acc shadow-sm" : "text-subtinta"
              }`}
            >
              {m === "lista" ? t("Icono") : t("Emoji")}
            </button>
          ))}
        </div>
      </div>

      {modo === "lista" ? (
        <div className="grid grid-cols-6 gap-2">
          {ICONOS_MARCA.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIcono(i)}
              className={`grid aspect-square place-items-center rounded-xl border-2 text-lg transition active:scale-95 ${
                icono === i ? "border-acc bg-acc-suave" : "border-borde bg-soft hover:border-acc/40"
              }`}
            >
              <span className="emoji">{i}</span>
            </button>
          ))}
        </div>
      ) : (
        <input
          value={icono}
          maxLength={4}
          onChange={(e) => onIcono(e.target.value)}
          placeholder={t("Escribe un emoji con tu teclado…")}
          className="w-full rounded-2xl border-2 border-borde bg-soft px-4 py-3 text-center text-2xl text-tinta outline-none placeholder:text-base placeholder:text-subtinta/60 focus:border-acc"
        />
      )}

      <div>
        <span className="mb-1 block text-sm font-semibold text-subtinta">{t("Color")}</span>
        <div className="flex flex-wrap gap-2">
          {COLORES_MARCA.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColor(c)}
              aria-label={`Color ${c}`}
              className={`h-9 w-9 rounded-full border-[3px] transition active:scale-90 ${
                color.toLowerCase() === c.toLowerCase() ? "border-tinta" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label
            className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border-[3px] border-dashed border-borde text-[10px] font-bold text-subtinta"
            title={t("Color personalizado")}
          >
            +
            <input
              type="color"
              value={color}
              onChange={(e) => onColor(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Selector de categoría con alta rápida ("+ Añadir nueva")          */
/* ---------------------------------------------------------------- */

export function CampoCategoria({
  label,
  valor,
  opciones,
  onChange,
  onCrear,
  conItbms = false,
}: {
  label: string;
  valor: string;
  opciones: Categoria[];
  onChange: (id: string) => void;
  onCrear: (nombre: string, itbms: boolean) => void;
  conItbms?: boolean;
}) {
  const t = useT();
  const [lista, setLista] = useState(false);
  const [alta, setAlta] = useState(false);
  const [nombre, setNombre] = useState("");
  const [itbms, setItbms] = useState(false);

  const elegida = opciones.find((c) => c.id === valor);

  function crear() {
    const limpio = nombre.trim();
    if (!limpio) {
      return;
    }
    onCrear(limpio, itbms);
    setNombre("");
    setItbms(false);
    setAlta(false);
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-subtinta">{label}</span>
      <button
        type="button"
        onClick={() => setLista(true)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-borde bg-soft px-4 py-3 text-left text-tinta active:scale-[0.99]"
      >
        <span className={elegida ? "flex items-center gap-2 font-medium" : "text-subtinta"}>
          {elegida && (
            <>
              <span className="emoji">{elegida.icono}</span>
              {elegida.nombre}
              {conItbms && elegida.itbms && (
                <span className="rounded-full bg-acc-suave px-2 py-0.5 text-[10px] font-black text-acc">
                  ITBMS 7%
                </span>
              )}
            </>
          )}
          {!elegida && (valor ? "" : t("Selecciona…"))}
        </span>
        <Icono nombre="flecha" className="h-4 w-4 rotate-90 text-subtinta" />
      </button>

      <Hoja abierta={lista} onCerrar={() => setLista(false)} titulo={label}>
        <div className="space-y-1.5">
          {opciones.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-subtinta">
              {t("Aún no hay categorías. Crea la primera.")}
            </p>
          )}
          {opciones.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setLista(false);
              }}
              className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left transition ${
                c.id === valor ? "bg-acc text-onacc" : "bg-soft text-tinta"
              }`}
            >
              <span className="emoji">{c.icono}</span>
              <span className="flex-1 font-semibold">{c.nombre}</span>
              {conItbms && c.itbms && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    c.id === valor ? "bg-onacc/20 text-onacc" : "bg-acc-suave text-acc"
                  }`}
                >
                  ITBMS 7%
                </span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setLista(false);
              setAlta(true);
            }}
            className="flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-borde px-4 py-3 text-left text-sm font-bold text-subtinta transition active:scale-[0.99]"
          >
            <Icono nombre="mas" className="h-4 w-4" />
            {t("Añadir una nueva categoría")}
          </button>
        </div>
      </Hoja>

      <Hoja
        abierta={alta}
        onCerrar={() => setAlta(false)}
        titulo={t("Nueva categoría")}
        pie={
          <div className="flex gap-2">
            <Boton variante="contorno" className="flex-1" onClick={() => setAlta(false)}>
              {t("Cancelar")}
            </Boton>
            <Boton className="flex-1" onClick={crear} disabled={!nombre.trim()}>
              {t("Crear")}
            </Boton>
          </div>
        }
      >
        <div className="space-y-4">
          <Campo
            label={t("Nombre de la categoría")}
            value={nombre}
            onChange={setNombre}
            placeholder={t("Ej. Supermercado, Bebidas, Ropa…")}
            autoFocus
          />
          {conItbms && (
            <div className="rounded-2xl border-2 border-borde bg-soft px-4 py-2">
              <Interruptor
                activo={itbms}
                onChange={setItbms}
                label="Cobra ITBMS (7%)"
                detalle="Los productos de esta categoría se les agregará el 7% al cotizar."
              />
            </div>
          )}
        </div>
      </Hoja>
    </div>
  );
}
