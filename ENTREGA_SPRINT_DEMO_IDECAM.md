# Entrega sprint demo PortalGIS IDECAM

Cambios incorporados para la versión demo:

- Migración declarativa a Node 22 en `engines` y Dockerfiles ya basados en `node:22-alpine`.
- Nuevo endpoint API `GET /catalog/discover` para descubrir capas reales desde GetCapabilities de IDECAM/GeoNode e IGN.
- Catálogo dinámico en frontend con botón `Catálogo IDECAM`, buscador, agrupación por dataset/workspace y agregado temporal por sesión.
- Capas dinámicas agregadas al panel de capas activas sin persistir en DB ni localStorage; al refrescar se restaura el estado inicial.
- Render de capas WFS mediante WMS cuando hay typename/endpoints disponibles, evitando dibujar miles de features vectoriales.
- WFS conservado para identify, estadísticas, informe, tablas y recortes, siempre con BBOX, límites, propertyName y cola/cancelación existentes.
- Proxy WFS con cache TTL simple, clamp de count y bloqueo de consultas grandes sin BBOX.
- Identificación por click con fallback WFS puntual por BBOX chica cuando el render visual es WMS.
- Informe técnico ajustado para que, si hay polígono de medición o digitalización, liste solo parcelas que intersectan el área dibujada, en tabla por nomenclatura/padrón y campos recomendados.
- Captura de mapa configurada con base compatible (`Esri World Imagery`) cuando el origen Google genera problemas de CORS.
- Digitalización mínima: punto, línea y polígono, atributos básicos por prompt, edición de vértices con Modify, exportación GeoJSON e inclusión en informe.

Validación realizada en este entorno:

- `tsc -p apps/web/tsconfig.json --noEmit`: OK.

Limitación de validación local:

- No se pudo ejecutar `corepack pnpm` completo porque el entorno del sandbox no resolvió `registry.npmjs.org`. En el VPS o PC con internet, ejecutar los comandos estándar:

```bash
corepack enable
corepack pnpm install
corepack pnpm web:typecheck
corepack pnpm web:build
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
docker compose config
docker compose up --build -d
```

Notas importantes:

- El ZIP excluye `.env`, `node_modules` y `dist` para no publicar secretos ni basura de compilación.
- Usar `.env.example` o `.env.production.example` como base.
- PostgreSQL no se expone públicamente; debe quedar interno en Docker.
