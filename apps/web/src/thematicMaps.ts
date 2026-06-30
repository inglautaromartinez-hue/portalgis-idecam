export const IRRIGATION_RIGHTS_PRESET_ID = 'parcelas-derecho-riego';

export interface ThematicMapPreset {
  id: typeof IRRIGATION_RIGHTS_PRESET_ID;
  title: string;
  description: string;
  source: string;
}

export const THEMATIC_MAP_PRESETS: ThematicMapPreset[] = [
  {
    id: IRRIGATION_RIGHTS_PRESET_ID,
    title: 'Parcelas con derecho de riego',
    description: 'Parcelarios cargados por BBOX con simbologia QGIS de concesion/tipo de derecho.',
    source: 'QML Derecho_Riego_Superficial_estilo.qml + catalogo real IDECAM',
  },
];
