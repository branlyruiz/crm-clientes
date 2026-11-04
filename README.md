# BR · Clientes

Mini app de seguimiento de clientes para GitHub Pages. Diseñada para iPhone: filas compactas con fondos por estado, próximas fechas primero y navegación flotante.

## Interfaz

- **Clientes:** resumen financiero plegable, filtro de estado en una línea y búsqueda por icono. Los eventos futuros aparecen de menor a mayor fecha y hora; después se muestran los pasados (más reciente primero) y los registros sin fecha. Otros filtros y órdenes están en el botón de ajustes.
- **Acordeón:** muestra tipo y categoría, y tres accesos con iconos: Editar, Abono y Estado. Editar y Abono abren ventanas separadas; Estado abre directamente el selector y guarda el cambio con su historial. Guardar correctamente cierra la ventana y el acordeón; un error conserva los datos para corregirlos. Archivar/Restaurar está visible en cada card y se puede deshacer.
- **Ficha:** tipo de cliente y categoría al principio; Servicio usa las 20 opciones del desplegable de `SEGUIMIENTO CLIENTES!E7` y Categoría las 4 de `D7`, comprobadas el 4 de noviembre de 2026. Los valores personalizados anteriores siguen disponibles. Teléfono y correo quedan al final en Contacto. Se retiró Próximo paso/Volver a contactar de la interfaz conservando los datos históricos en respaldos. Las notas son opcionales y los abonos registrados se consultan en un bloque plegable.
- **Por cobrar:** nombre, evento, saldo y botón `+` para registrar el abono directamente. Un pago completo retira la fila de esta sección; el cliente sigue en Clientes.
- **Agenda:** calendario mensual con días marcados, selección de fecha, lista de próximos eventos por fecha/hora y acordeón para los demás detalles. Se pueden consultar días pasados. El contador de próximos usa los mismos criterios que la lista.
- **Menú flotante:** Clientes, Agenda, Por cobrar y Archivo; el botón `+` separado crea un cliente.

Paleta: base verde bosque y neutros cálidos; pendientes en ámbar, confirmados en salvia, edición en lavanda, entrega en azul, aplazados/terminados en gris y cancelados en coral. Los estados también aparecen como texto. Los controles principales tienen áreas táctiles de 44 px, siguiendo la [guía de tamaño de objetivos de W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).

## Usar

Abre la web en Safari y selecciona Compartir → Agregar a Inicio. Activa Abrir como app web si aparece. La app puede abrirse sin conexión después de la primera carga completa.

Los clientes se guardan exclusivamente en el dispositivo. No se publican en este repositorio ni se envían a un servidor. Para trasladarlos, utiliza Más opciones → Respaldar todos los datos e Importar respaldo JSON. Importar conserva los registros existentes y omite IDs repetidos. Haz respaldos antes de borrar los datos de Safari o cambiar de teléfono.

La versión anterior en Sites conserva sus propios datos; el respaldo de migración se entrega por separado. Esta versión no depende de Sites y no requiere iniciar sesión con ChatGPT.

## Desarrollar

Node.js 22.13 o superior.

```
npm ci
npm run dev
npm test
npm run build
```

`docs/` es el sitio estático compilado. GitHub Pages publica la rama `main`, carpeta `/docs`. Las rutas de iconos, manifiesto, módulos y caché son relativas para funcionar dentro de `/crm-clientes/`. El servicio de caché se limita al ámbito de esta mini app y no elimina cachés de otras apps del mismo dominio.

El proyecto conserva la prioridad por estado como orden opcional, búsqueda, filtros, contactos pendientes, archivo reversible, pagos e historial. Las cifras usan pesos colombianos enteros. El guardado valida abonos, revisiones y fechas y muestra fallos de almacenamiento sin aparentar éxito. La clave de almacenamiento y el formato de respaldo se mantienen compatibles con la versión anterior.

## Publicación

Compila, revisa y confirma los archivos de `docs/` junto con el código. La publicación de Pages ocurre después de actualizar `main`. No incluyas respaldos de clientes, archivos de trabajo o claves en Git.
