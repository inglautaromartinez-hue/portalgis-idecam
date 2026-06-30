import proj4 from 'proj4';

export const EPSG_4326 = 'EPSG:4326';
export const EPSG_3857 = 'EPSG:3857';
export const EPSG_22172 = 'EPSG:22172';

const DEFINITIONS: Record<string, string> = {
  [EPSG_4326]: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
  [EPSG_3857]:
    '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
  // EPSG:22172 · Argentina/Gauss-Krüger faja 2, usado por capas IDECAM en el QGIS original.
  // Se registra para cálculos métricos y transformación BBOX. Si el servidor WFS informa una definición distinta,
  // el frontend/backend podrá reemplazar esta definición desde metadatos oficiales.
  [EPSG_22172]:
    '+proj=tmerc +lat_0=-90 +lon_0=-69 +k=1 +x_0=2500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
};

let registered = false;

export function registerKnownCrs(): void {
  if (registered) return;
  for (const [code, definition] of Object.entries(DEFINITIONS)) {
    proj4.defs(code, definition);
  }
  registered = true;
}

export function isKnownCrs(code: string): boolean {
  registerKnownCrs();
  return Boolean(proj4.defs(code));
}

export function getProj4(): typeof proj4 {
  registerKnownCrs();
  return proj4;
}
