# Mi Despensa v1.0.0

**Tu despensa, tus tiendas y tus precios, siempre a la mano.**

Primera versión pública de Mi Despensa: organiza tus compras con historial de
precios, listas para el súper y cotizaciones listas para factura.

## Qué incluye

- **Tiendas**: crea tus tiendas con tipo, lugar, icono y color; agrúpalas por
  categorías propias.
- **Productos con historial**: registra el precio en cada tienda y mira la
  gráfica para saber dónde y cuándo conviene comprar.
- **Listas de compras**: marca lo que llevas mientras caminas por la tienda;
  modo tienda con pestañas Buscar / Cotizar / Historial y botón para
  **imprimir** la lista (o guardarla como PDF).
- **Cotizador con factura**: arma el cotizado y ve subtotal, **ITBMS 7 %**
  por producto cuando corresponde, impuestos y total, como en una factura.
- **Ajustes**: apariencia, categorías con casilla de ITBMS y respaldo
  exportar/importar en JSON.
- Buscador, ayuda y acerca de. Tus datos quedan solo en tu dispositivo
  (sin nube); la primera vez se cargan datos de ejemplo que puedes borrar.

## Instalación

1. Descarga `MiDespensa-1.0.0.apk` desde los assets de esta Release.
2. Si Android lo pide, autoriza la instalación de apps de orígenes desconocidos
   para tu navegador o gestor de archivos.
3. Abre la app y listo.

## Notas técnicas

- Paquete: `com.irvin.midespensa` · versionCode 10000.
- Web-first: Vite + React + TypeScript + Tailwind, empaquetada con Capacitor 6.
- Firmada con el keystore del proyecto (se conserva en los secretos del repositorio).
- El repo es **público** para poder consultar las releases sin autenticación.
