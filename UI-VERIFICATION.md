# CRM BR · Clientes 2.1.0

Fecha: 2026-11-16. Alcance: únicamente `br-clientes`.

## Auditoría y decisiones

La navegación anterior reiniciaba filtros y desplazamiento, ensanchaba la opción activa y ocultaba las otras etiquetas. Había tipografía reducida para encajar importes, nombres truncados y colores fijos sin modo oscuro. El navegador no representaba los detalles en su historial. Las confirmaciones y el almacenamiento con revisión de concurrencia ya funcionaban y se conservaron.

La actualización mantiene las secciones, estados, ordenamientos, calendario, catálogo de servicios, pagos e historial. Introduce memoria de vista durante la sesión, navegación estable, textos que pueden ocupar varias líneas, preferencias de aspecto, movimiento cancelable y retorno protegido desde detalles. Las animaciones se limitan a la presentación. `src/crm.ts` y `src/storage.ts` no se modificaron.

## Evidencia local

- Compilación de producción y TypeScript: correctos.
- Pruebas unitarias: 21/21 (cálculos, fechas, importación, concurrencia, pagos, movimiento y cancelación).
- Recorrido automatizado de navegador: 26 comprobaciones correctas, 60 registros ficticios iniciales. Incluye filtros, orden, acordeón y desplazamiento por sección; menú estable; pulsaciones rápidas/repetidas; Atrás/Adelante; borradores; foco y Escape; guardado, pago completo, archivo/deshacer; error de almacenamiento y reintento; doble envío retenido por un bloqueo de escritura.
- Tamaños 320, 375, 768 y 1440 px: capturas inspeccionadas, nombres largos e importes grandes sin desbordamiento horizontal.
- Modo claro/oscuro y preferencia persistente; movimiento reducido del sistema y de la app.
- axe-core: sin infracciones detectadas en home expandido, ficha y agenda, en ambos temas, para las reglas WCAG A/AA seleccionadas. Inspección de controles visibles de agenda a 320 px: ninguno por debajo de 44 × 44 px.
- Respaldo original de 14 clientes: leído en memoria con el almacenamiento actual, sin escrituras ni modificaciones del archivo. No se publican datos personales.
- PWA: servidor local alternó la compilación anterior y la nueva en la misma dirección. Un cliente ficticio y la preferencia oscura sobrevivieron a la actualización. Se verificó `?v=9`, nueva caché, reapertura sin conexión y manifiesto idéntico. Sin errores de consola en ese recorrido.
- Revisión del diff: sin cambios en fórmulas, esquema, catálogo, identidad PWA ni otras mini apps. Sin datos reales ni archivos de trabajo incluidos.

## Límites

Las pruebas se hicieron con Chrome automatizado, no con un iPhone físico ni con VoiceOver. La auditoría automática no certifica por sí sola toda la conformidad WCAG. No se midieron Core Web Vitals. Los borradores se conservan mientras el formulario está abierto y se protege la salida; no se añadió almacenamiento persistente de borradores.

Producción: https://branlyruiz.github.io/crm-clientes/ — conservar también los enlaces con parámetros anteriores. La publicación y la respuesta de producción se comprueban después del envío de esta versión.
