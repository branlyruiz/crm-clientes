# BR · Clientes

Mini app de seguimiento de clientes para GitHub Pages. Diseñada para iPhone: tarjetas resumidas con cliente, servicio, fecha y saldo, acordeón editable y ficha completa para abonos e historial.

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

El proyecto conserva la jerarquía por estado, búsqueda, filtros, ordenación, contactos pendientes, archivo reversible, pagos e historial. Las cifras usan pesos colombianos enteros. El guardado valida abonos, revisiones y fechas y muestra fallos de almacenamiento sin aparentar éxito.

## Publicación

Compila, revisa y confirma los archivos de `docs/` junto con el código. La publicación de Pages ocurre después de actualizar `main`. No incluyas respaldos de clientes, archivos de trabajo o claves en Git.
