export type ThemeMode = 'light' | 'dark';

export interface PortalSectionConfig {
  id: string;
  title: string;
  groupId?: string;
  layerIds?: string[];
}

export const PORTAL_THEME_STORAGE_KEY = 'portalgis-theme';
export const PORTAL_PARCEL_MIN_ZOOM = 10;
export const PORTAL_MAX_WFS_CONCURRENCY = 3;
export const PORTAL_DISTRICTS_LAYER_ID = 'geonode_distritos_mendoza_epsg4326_a476bb3e_b06b_4ee3_a05b_5cd9d23d160a';

export const PORTAL_INITIAL_VISIBLE_LAYER_IDS = new Set([
  'Google_Satellite_Hybrid_f9b3fd1e_4657_40b6_abd4_62532b57d47b',
  'geonode_distritos_mendoza_epsg4326_a476bb3e_b06b_4ee3_a05b_5cd9d23d160a',
]);

export const PORTAL_SERVICE_AREA_LAYER_IDS = new Set([
  'geonode_area_servida_cloacas_c11a682a_9125_4d66_8916_7e4a73bd5742',
  'geonode_area_serv_gas_4f031f62_c39a_4bbd_bb42_40cac2a5b163',
  'geonode_area_servida_agua_6f6bab79_4da5_4222_9139_2e6c758722e0',
  'geonode_area_serv_elect_5f6eccaf_59bb_4e89_ae72_6423d90140f8',
]);

export const PORTAL_IGN_CARTA_LAYER_IDS = new Set([
  'ign_cartas_50000_a9ad48b8_7a37_493a_af7e_11677d972d99',
  'ign_cartas_100000_9e95cc44_38a7_4782_9f50_e47d5a96c69e',
  'ign_cartas_250000_6dbc98aa_ee6b_4a5c_bcca_6a6b552c4d9a',
  'ign_cartas_500000_d3173dc7_d118_4b8e_ab4d_5452768fd16a',
]);

export const PORTAL_LAYER_OPACITY_OVERRIDES = new Map<string, number>(
  [
    ...[...PORTAL_SERVICE_AREA_LAYER_IDS].map((id): [string, number] => [id, 0.4]),
    [PORTAL_DISTRICTS_LAYER_ID, 0.05],
  ],
);

export const PORTAL_VISUAL_SECTIONS: PortalSectionConfig[] = [
  {
    id: 'portal_base_layers',
    title: 'Capas base',
    layerIds: ['Google_Satellite_Hybrid_f9b3fd1e_4657_40b6_abd4_62532b57d47b'],
  },
  {
    id: 'portal_context_layers',
    title: 'Limites / contexto territorial',
    layerIds: ['geonode_distritos_mendoza_epsg4326_a476bb3e_b06b_4ee3_a05b_5cd9d23d160a'],
  },
  {
    id: 'portal_parcelarios',
    title: 'Parcelarios Municipales',
    groupId: 'group_idecam_wfs_demo_parcelarios_municipales',
  },
  {
    id: 'portal_areas_servicios',
    title: 'Areas con servicios',
    groupId: 'group_idecam_wfs_demo_areas_con_servicios',
  },
  {
    id: 'portal_irrigacion',
    title: 'Irrigacion',
    groupId: 'group_irrigacion',
  },
  {
    id: 'portal_infraestructura',
    title: 'Infraestructura energia',
    groupId: 'group_infraestructura_energia',
  },
  {
    id: 'portal_intervenciones',
    title: 'Intervenciones CAM - Objetos de Mensura',
    groupId: 'group_idecam_wfs_demo_intervenciones_cam_objetos_de_mensura',
  },
  {
    id: 'portal_ign',
    title: 'Capas IGN',
    groupId: 'group_capas_ign',
  },
];
