# PORTALGIS – IDECAM · PARTE 1

**Autor/metadata:** `laugis`

Esta entrega crea una base sólida y auditable del proyecto:

- Monorepo PNPM/Turbo.
- Backend Fastify + Prisma + PostgreSQL/PostGIS.
- Seed idempotente con las **46 capas reales** extraídas del QGIS/JSON.
- Catálogo de grupos/capas.
- Login admin con contraseña hasheada.
- Proxy WFS seguro con allowlist.
- Transformación BBOX correcta entre `EPSG:3857`, `EPSG:4326` y `EPSG:22172`.

## Requisitos

- Node.js 22 LTS
- PNPM 11+ via Corepack
- Docker y Docker Compose

En Windows, ejecutar el proyecto desde un volumen NTFS. PNPM workspaces necesita enlaces locales; FAT32 no los soporta.

## Instalación local

```bash
cp .env.example .env
pnpm install
pnpm build
pnpm typecheck
pnpm lint
```

## Base de datos local con Docker

```bash
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm api:dev
```

## Levantar todo con Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

El contenedor de API ejecuta:

1. build de paquetes compartidos,
2. `prisma migrate deploy`,
3. `prisma db seed`,
4. `node dist/index.js`.

## Endpoints de validación

```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/db
curl http://localhost:3001/catalog
curl http://localhost:3001/catalog/tree
```

## Login admin

```bash
curl -i -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@idecam.local","password":"Cambiar_Esta_Clave_123!"}'
```

## Proxy WFS

GetCapabilities:

```bash
curl "http://localhost:3001/wfs/capabilities?targetUrl=https%3A%2F%2Fgeonode-cam.marketsis.com.ar%2Fgeoserver%2Fwfs"
```

DescribeFeatureType:

```bash
curl "http://localhost:3001/wfs/describe?targetUrl=https%3A%2F%2Fgeonode-cam.marketsis.com.ar%2Fgeoserver%2Fwfs&typeName=geonode%3Adistritos_mendoza_epsg4326"
```

GetFeature por BBOX transformado desde mapa EPSG:3857 hacia capa EPSG:4326:

```bash
curl "http://localhost:3001/wfs/feature?targetUrl=https%3A%2F%2Fgeonode-cam.marketsis.com.ar%2Fgeoserver%2Fwfs&typeName=geonode%3Adistritos_mendoza_epsg4326&layerCrs=EPSG%3A4326&mapCrs=EPSG%3A3857&bbox=-7650000,-3910000,-7600000,-3860000"
```

## Validación de compilación

```bash
pnpm build
pnpm typecheck
pnpm lint
```

## Notas críticas

- Las capas oficiales se preservan en `packages/shared/src/idecam-layers.seed.ts`.
- El seed conserva `fields`, `style`, `labeling`, `datasource_raw`, CRS y órdenes reales.
- El proxy WFS solo permite hosts de la allowlist.
- El BBOX de OpenLayers (`EPSG:3857`) se transforma al CRS real de cada capa antes de consultar WFS.

## Datos locales sincronizados

```bash
corepack pnpm data:sync:critical
corepack pnpm data:sync
```

`data:sync:critical` prepara solo las capas necesarias para la demo usando el seed real. `data:sync` descubre todas las capas por `GetCapabilities`; queda reservado para mantenimiento completo. Ambos generan `data/catalog`, `data/layers`, `data/indexes` y `data/stats` y omiten snapshots correctos existentes. El visor consulta primero `/local/features` y `/local/statistics/*`; WFS queda como fallback declarado.

Los GeoJSON e indices son datos locales regenerables y no se suben al repositorio.

## Preparar repo para GitHub

No subir `.env`, `node_modules`, `dist`, backups ni snapshots GeoJSON pesados. Verificar antes del primer commit:

```bash
git status --short
git add .
git commit -m "PortalGIS IDECAM demo funcional"
git push
```

En un servidor o PC nuevo:

```bash
corepack pnpm install
corepack pnpm data:sync:critical
docker compose up --build -d
```
