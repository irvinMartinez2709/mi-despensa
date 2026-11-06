import { useState } from "react";
import { Icono } from "./iconos";
import { Tarjeta } from "./ui";
import { useT } from "../i18n";

const PREGUNTAS: { p: string; a: string }[] = [
  {
    p: "¿Cómo creo una tienda?",
    a: "Entra a la sección Crear y toca «Crear tienda». Escribe el nombre, elige el tipo (si no existe, toca «Añadir una nueva categoría» y escríbela), agrega el lugar si quieres y elige un icono o emoji con su color.",
  },
  {
    p: "¿Cómo agrego productos?",
    a: "En Crear toca «Crear un producto». Elige la tienda donde se vende, su tipo de producto, el precio (puede quedar vacío si aún no lo sabes) y su marca. También puedes crear productos desde dentro de cada tienda.",
  },
  {
    p: "¿Qué es el historial de precios?",
    a: "Cuando editas un precio e indicas si fue una subida o una bajada, el cambio se guarda con su fecha. En «Historial de precios» (dentro de cada tienda) ves el precio actual, el anterior, la gráfica y todos los precios que ha tenido.",
  },
  {
    p: "¿Qué es ITBMS (7%)?",
    a: "Es el impuesto de 7% de Panamá. Al crear o editar una categoría de producto puedes marcar si cobra ITBMS. Al cotizar, esos productos agregan el 7% automáticamente en la factura.",
  },
  {
    p: "¿Cómo uso la lista de compras?",
    a: "Crea una lista en Crear, elige la tienda y marca los productos. Cuando vayas a comprar, abre la lista y ve tocando lo que ya llevas; la barra te muestra cuánto falta.",
  },
  {
    p: "¿Cómo cotizo antes de ir a la tienda?",
    a: "En la sección Cotizar elige la tienda, sube o baja las cantidades con los botones + y −, y verás el total en vivo. Toca «Ver detalles» para abrir la factura con el subtotal, el ITBMS y el total a pagar.",
  },
  {
    p: "¿Puedo buscar productos rápido?",
    a: "Sí: en «Buscar un producto» escribe al inicio del nombre. Si escribes «So» verás primero los que empiezan por «So» (ej. Soda). También puedes filtrar por tienda, tipo y rango de precio.",
  },
  {
    p: "¿Y si abro una tienda?",
    a: "Al tocar una tienda la interfaz cambia: solo verás Buscar un producto, Cotizar y Historial de precios, todo limitado a esa tienda. Toca «Salir de [nombre]» para volver.",
  },
  {
    p: "¿Dónde quedan mis datos?",
    a: "Todo se guarda en tu dispositivo (sin nube). En Ajustes → Datos y respaldo puedes exportar todo a un archivo JSON e importarlo en otro dispositivo.",
  },
];

export default function Ayuda({ onVolver }: { onVolver: () => void }) {
  const t = useT();
  const [abierta, setAbierta] = useState<number | null>(null);

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onVolver}
          aria-label={t("Volver")}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-borde bg-card text-subtinta active:scale-95"
        >
          <Icono nombre="atras" className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-black leading-tight text-tinta">{t("Ayuda")}</h1>
      </header>

      <div className="space-y-2">
        {PREGUNTAS.map((q, i) => {
          const activa = abierta === i;
          return (
            <Tarjeta key={q.p} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setAbierta(activa ? null : i)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-soft/40"
              >
                <span className="flex-1 text-sm font-extrabold text-tinta">{q.p}</span>
                <Icono
                  nombre="flecha"
                  className={`h-4 w-4 shrink-0 text-subtinta transition ${activa ? "rotate-90" : ""}`}
                />
              </button>
              {activa && (
                <p className="animate-rise border-t border-borde/70 px-4 py-3 text-[13px] leading-relaxed text-subtinta">
                  {q.a}
                </p>
              )}
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
}
