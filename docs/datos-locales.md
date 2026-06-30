# Snapshots locales IDECAM

Requisito: Node.js 22 LTS (`.nvmrc`).

## Sincronizar

```bash
corepack pnpm data:sync:critical
corepack pnpm data:sync
corepack pnpm data:sync -- --layer=geonode:Parcelas_maipu_4326
corepack pnpm data:sync -- --force
```

`data:sync:critical` es el comando recomendado para preparar una demo: selecciona desde el seed real los parcelarios municipales, Red de Riego, Distritos de Mendoza, intervenciones CAM, areas de servicio, mensuras y VESEP. No inicia la descarga general de las 272 capas.

El proceso consulta `GetCapabilities` de los endpoints WFS reales del catálogo consolidado, pagina cada `GetFeature`, solicita `EPSG:4326` y continúa aunque una capa falle. `data/catalog/sync-report.json` registra capas correctas, parciales y fallidas. Una segunda ejecución reanuda desde las fallidas.

Para preparar la demo no es necesario repetir las 272 capas. Priorice los 18 `geonode:Parcelas_*_4326`, `geonode:red_riego_actual_4326`, distritos, mensuras/VESEP, intervenciones y areas de servicio usando `-- --layer=<typename>`. El comando sin `--layer` queda reservado para mantenimiento completo y es reanudable.

Los GeoJSON e indices se conservan en la PC o servidor, pero quedan fuera de Git. Para un despliegue nuevo:

```bash
corepack pnpm install
corepack pnpm data:sync:critical
docker compose up --build -d
```

## Salida

- `data/catalog/idecam-catalog.json`: catálogo dinámico y estado de snapshots.
- `data/layers/<workspace>/`: GeoJSON; capas grandes se dividen y comprimen en partes `.geojson.gz`.
- `data/indexes/`: BBOX por feature.
- `data/stats/`: conteos, campos, tipos, categorías acotadas y extensión global.

Los directorios de features, índices y estadísticas no se versionan porque pueden superar límites prácticos de GitHub. Catálogo y reporte sí pueden conservarse como manifiesto reproducible.

## Runtime

Docker monta `./data` en `/app/data`. El API sirve features locales por BBOX y estadísticas globales sobre el dataset completo. Si falta un snapshot, el visor muestra que usa WFS en vivo; nunca presenta ese fallback parcial como estadística global.

`local_irrigation_parcels_provincial` es una capa lógica: agrega por BBOX los parcelarios municipales completos sin crear otro archivo provincial gigante. Sus estadísticas suman todos los snapshots y exponen `sourceLayers`; para la entrega actual son 18 capas y 640.956 parcelas.

Reinicie el servicio API después de una sincronización para renovar el catálogo y las cachés en memoria: `docker compose restart api`.
