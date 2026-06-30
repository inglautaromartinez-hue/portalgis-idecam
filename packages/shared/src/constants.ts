export const APP_AUTHOR = 'laugis' as const;
export const APP_NAME = 'PORTALGIS - IDECAM' as const;

export const DEFAULT_MAP_CRS = 'EPSG:3857';
export const PROJECT_CRS = 'EPSG:4326';
export const WGS84_CRS = 'EPSG:4326';
export const WEB_MERCATOR_CRS = 'EPSG:3857';
export const MENDOZA_METRIC_CRS = 'EPSG:22172';

export const OFFICIAL_WFS_HOSTS = [
  'wms.ign.gob.ar',
  'geonode-cam.marketsis.com.ar',
] as const;

export const ESRI_WORLD_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const GOOGLE_SATELLITE_HYBRID_URL =
  'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
