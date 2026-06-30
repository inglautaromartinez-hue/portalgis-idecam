# Publicacion rapida de demo

Objetivo: exponer la web local sin cambiar seed, catalogo ni API.

La web queda preparada para usar rutas same-origin:

- Frontend: `http://localhost:3000`
- API desde navegador: `/api`
- Proxy interno web -> API: `API_PROXY_TARGET`

## Opcion A - Cloudflare Tunnel temporal con Docker

Requisitos:

- Docker Desktop funcionando.
- Compose levantado con `docker compose up --build -d`.

Comando:

```bash
docker run --rm --name portalgis_idecam_tunnel cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://host.docker.internal:3000
```

La consola muestra una URL `https://*.trycloudflare.com`. Esa URL publica debe abrir el visor y las llamadas a `/api/...` deben volver por el web server local.

Validacion minima sobre la URL publica:

```txt
https://URL_PUBLICA.trycloudflare.com
https://URL_PUBLICA.trycloudflare.com/api/health
https://URL_PUBLICA.trycloudflare.com/api/health/db
```

## Opcion B - Cloudflare Tunnel instalado en Windows

Si `cloudflared` esta instalado:

```bash
cloudflared tunnel --url http://localhost:3000
```

## Variables utiles

```env
VITE_API_BASE_URL=/api
API_PROXY_TARGET=http://localhost:3001
CORS_ORIGIN=http://localhost:3000,https://URL_PUBLICA.trycloudflare.com
```

Para Docker Compose, `API_PROXY_TARGET` ya apunta a `http://api:3001`.

## Limites del tunel temporal

- La URL cambia cada vez que se reinicia el tunel.
- No sirve como publicacion institucional permanente.
- No debe usarse para administrar secretos reales.

