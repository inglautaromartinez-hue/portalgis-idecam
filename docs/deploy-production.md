# Publicacion permanente

Este proyecto no incluye todavia una publicacion institucional permanente. Para activarla sin reescribir el portal:

1. Definir dominio o subdominio oficial.
2. Desplegar PostGIS con backup y persistencia fuera de volumen temporal.
3. Desplegar API y web detras de HTTPS.
4. Configurar variables:

```env
NODE_ENV=production
COOKIE_SECURE=true
CORS_ORIGIN=https://portal.idecam.example
VITE_API_BASE_URL=/api
API_PROXY_TARGET=http://api:3001
```

5. Mantener `/api` como ruta publica del backend para evitar CORS del navegador.
6. Ejecutar migraciones y seed idempotente:

```bash
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
```

7. Validar que el seed mantiene 46 capas, 7 grupos y metadata `author: laugis`.

## Pendientes de operacion

- Backups automaticos de base de datos.
- Monitoreo de API y tiempos WFS.
- Dominio oficial y certificado.
- Credenciales reales fuera del repositorio.
