# Datos locales

Los GeoJSON e indices de este directorio se generan localmente y no se versionan.

Para preparar los datos necesarios para la demo:

```bash
corepack pnpm data:sync:critical
```

Para mantenimiento completo de todas las capas descubiertas:

```bash
corepack pnpm data:sync
```

Git conserva solamente este archivo, los manifiestos de `catalog/`, las estadisticas livianas de `stats/` y los metadatos pequenos de capa.
