# PortalGIS IDECAM - checklist de demo institucional

Autor/metadata: `laugis`

Este documento deja el recorrido estable para la charla. No reemplaza el README tecnico de Fase 1.

## URLs locales

- Web: http://localhost:3000
- API health: http://localhost:3001/health
- DB health: http://localhost:3001/health/db

## Comandos de validacion obligatorios

```bash
corepack pnpm install
corepack pnpm web:typecheck
corepack pnpm web:build
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
docker compose config
docker compose up --build -d
```

## Recorrido de demo

1. Abrir http://localhost:3000.
2. Confirmar mapa base Google Satellite Hybrid visible.
3. Prender/apagar una capa desde el arbol real.
4. Activar mapa CAM `Parcelas con derecho de riego`.
5. Confirmar `Parcelas con derecho de riego - Provincial` y `Red de Riego` activas.
6. Ver la leyenda QGIS, aislar una categoria y abrir su tabla.
7. Identificar una parcela o distrito con click.
8. Confirmar atributos limpios en popup.
9. Abrir `Estadisticas`.
10. Ejecutar estadistica simple global sobre la capa provincial.
11. Ejecutar estadistica cruzada prearmada con `Calcular cruce global`.
12. Exportar CSV y abrirlo en Excel/LibreOffice. El archivo incluye `sep=;` y BOM UTF-8 para abrir columnas correctamente.
13. Medir distancia.
14. Medir area con poligono.
15. Confirmar area/perimetro en la herramienta.
16. Abrir `Imprimir` y generar informe tecnico.
17. Confirmar que el informe muestra capas activas, atributos, estadisticas, mediciones y vertices.

## Estado funcional para la charla

- Catalogo real: se conserva el seed de 46 capas y 7 grupos.
- Datos: el visor consulta primero snapshots por `/api/local/features` y `/api/local/statistics/*`. `/api/wfs/feature` queda como fallback cuando una capa no fue sincronizada.
- BBOX: el navegador envia BBOX del mapa en `EPSG:3857`; la API transforma al CRS efectivo de cada capa.
- Estadisticas: `Global - toda la capa` usa el snapshot completo; `Area actual / poligono` es un modo explicito y se rotula como parcial cuando corresponde.
- Informe tecnico: es una vista HTML imprimible. Para PDF, usar la accion de impresion del navegador y elegir "Guardar como PDF".

## Funciones no presentadas como completas

- Publicacion permanente: requiere dominio/tunel configurado. Ver `docs/deploy-demo.md` y `docs/deploy-production.md`.
- Zoom perfecto a capa: queda como mejora posterior de herramientas de capa; no bloquear la demo con eso.
