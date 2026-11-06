import { useEffect, useState } from "react";
import { ESLOGAN } from "../version";
import { useT } from "../i18n";

/**
 * Pantalla de bienvenida: se mantiene ~2.5 s y sale con un fundido
 * (2.9 s en total), para que se perciba como una presentación real.
 */
export default function Splash({ tono, onDone }: { tono?: string; onDone: () => void }) {
  const t = useT();
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const inicio = window.setTimeout(() => setSaliendo(true), 2500);
    const fin = window.setTimeout(onDone, 2950);
    return () => {
      window.clearTimeout(inicio);
      window.clearTimeout(fin);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center px-8 text-center transition-opacity duration-500 ${
        saliendo ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: tono || "#123C63" }}
    >
      <style>{`
        @keyframes despensa-aparece {
          0% { opacity: 0; transform: scale(0.86) translateY(10px); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes despensa-brillo {
          0% { opacity: 0.15; }
          50% { opacity: 0.5; }
          100% { opacity: 0.15; }
        }
        @keyframes despensa-carga {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div
        className="relative"
        style={{ animation: "despensa-aparece 0.9s cubic-bezier(.2,.8,.2,1) both" }}
      >
        <div
          className="absolute inset-0 -z-10 scale-150 rounded-full bg-sky-400 blur-3xl"
          style={{ animation: "despensa-brillo 2.4s ease-in-out infinite" }}
        />
        <img
          src="./logo.png"
          alt=""
          className="h-40 w-40 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        />
      </div>

      <h1
        className="mt-6 text-3xl font-black tracking-tight text-white"
        style={{ animation: "despensa-aparece 0.9s 0.2s cubic-bezier(.2,.8,.2,1) both" }}
      >
        Mi Despensa
      </h1>
      <p
        className="mt-1.5 max-w-[280px] text-sm font-medium leading-snug text-white/70"
        style={{ animation: "despensa-aparece 0.9s 0.35s cubic-bezier(.2,.8,.2,1) both" }}
      >
        {t(ESLOGAN)}
      </p>

      <div className="mt-10 h-1 w-32 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full w-1/2 rounded-full bg-sky-300"
          style={{ animation: "despensa-carga 1.1s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}
