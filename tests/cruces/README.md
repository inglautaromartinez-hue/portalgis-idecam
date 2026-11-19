# Regresión del cruce espacial de PortalGIS

Base auditada: 15b7d64841087f95077576c0ce03034db627f3f2. Casos H03 y H04 de WORK 01. Ensayo local con datos sintéticos en EPSG:4326.

El panel Estadísticas → Cruzada llama a queryCrossStatistics, que envía un POST a /local/statistics/cross-query. La ruta usa LocalDataService.crossStatistics. Antes, la rama residual de geometriesIntersect aceptaba cualquier par de líneas con envolventes superpuestas. El servicio devolvía partial=false y una lista vacía de advertencias independientemente de las dos respuestas de carga. App.tsx usaba ese estado y agregaba la etiqueta estática «capas completas».

La corrección usa la envolvente para descartar pares y comprueba el contacto entre las geometrías candidatas. El estado de cada entrada recoge tanto el truncamiento de la consulta como la marca partial de su snapshot. Una carga parcial tiene prioridad sobre ready y empty. El servicio devuelve avisos separados por insumo y el panel los presenta junto con el conteo.

| Objetivo / agrupamiento | Antes, líneas disjuntas / secantes (API) | Después, disjuntas / secantes | Estado y aviso visibles |
|---|---|---|---|
| Completo / completo | 1 / 1, ready | 0 / 1 | Sin datos / Listo |
| Parcial / completo | 1 / 1, ready | 0 / 1 | Datos parciales. Capa objetivo incompleta. |
| Completo / parcial | 1 / 1, ready | 0 / 1 | Datos parciales. Capa de agrupamiento incompleta. |
| Parcial / parcial | 1 / 1, ready | 0 / 1 | Datos parciales. Capa objetivo incompleta. Capa de agrupamiento incompleta. |

Con cero y cobertura completa, el gráfico dice «No se encontraron cruces.». Con cero y cobertura parcial dice «No se encontraron cruces entre las entidades cargadas. Puede haber otros en los datos pendientes.». Con un cruce, el panel muestra «Coincidencias: 1.» y el grupo QA con valor 1.

En la base, el selector de agrupamiento sólo ofrecía polígonos. Por eso la reproducción geométrica original se hizo por la API y la lectura del mensaje anterior desde los controles se hizo con una línea y un polígono. Para las cuatro combinaciones, el panel original informó «Cruzada global - capas completas», incluso con cobertura parcial. Con cero coincidencias mostraba «Sin datos» y «Configure el cruce y pulse Calcular.». En la rama corregida se seleccionaron dos líneas desde el mismo panel en los ocho casos.

## Repetición

Con las dependencias del monorepo instaladas y los paquetes gis-core, shared, API y web compilados, ejecutar desde la raíz:

```sh
export DATA_DIR="$(mktemp -d)"
python3 tests/cruces/snapshots.py "$DATA_DIR"
node tests/cruces/matriz.cjs
node tests/cruces/panel.cjs corregido apps/web/dist
```

panel.cjs requiere jsdom disponible para Node (se puede instalar en un directorio de pruebas separado y exponer mediante NODE_PATH). Monta el bundle real, acciona botones y selectores del visor, y conecta fetch al enrutador real con Fastify.inject. Simula las dimensiones del mapa y omite el render de teselas. Para comparar la base, compilar la revisión auditada y pasar a panel.cjs los argumentos base, directorio web compilado y raíz de esa revisión.

Las líneas disjuntas son (0,0)–(2,2) y (0,1)–(2,3). La secante de control es (0,2)–(2,0). matriz.cjs verifica las ocho respuestas de la ruta y el caso del informe con dos respuestas truncadas (dos entidades informadas y una recibida por lado).

Para repetir en Chromium con Playwright para Python, servir los mismos snapshots con node tests/cruces/api.cjs, iniciar Vite en el puerto 3100 y ejecutar python tests/cruces/visor.py. En este entorno se ejecutó la matriz de la API y del panel con DOM simulado. Chromium independiente no pudo abrir el socket de inicio. No se realizó una comprobación visual del mapa ni un despliegue.
