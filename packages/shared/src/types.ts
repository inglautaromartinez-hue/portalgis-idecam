export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject { [key: string]: JsonValue; }

export interface ExtractedGroup {
  name: string;
  path: string;
  parent: string;
  checked: string;
  expanded: string;
  depth: number;
}

export interface ExtractedLayer {
  tree_order: number;
  draw_order_qgis_layerorder: number;
  id: string;
  name: string;
  group_path: string;
  checked: string;
  visible_initial: boolean;
  provider: string;
  qgis_type: string;
  geometry: string | null;
  wkbType: string | null;
  authid: string | null;
  srsname_from_uri: string | null;
  effective_srs: string | null;
  typename: string | null;
  endpoint_url: string | null;
  version: string | null;
  restrictToRequestBBOX: string | null;
  datasource_raw: string | null;
  fields: string[];
  style: JsonValue | null;
  labeling: JsonValue | null;
  layerOpacity: string | number | null;
}

export interface ExtractedProjectCrs {
  authid: string;
  proj4?: string;
  description?: string;
}

export interface ExtractedInitialExtent {
  xmin: string;
  ymin: string;
  xmax: string;
  ymax: string;
}

export interface ExtractedIdecamData {
  groups: ExtractedGroup[];
  layer_tree: JsonValue;
  layers: ExtractedLayer[];
  project_crs: ExtractedProjectCrs;
  initial_extent: ExtractedInitialExtent;
  plugin_spec: JsonValue;
}

export interface SeedWfsConnection {
  id: string;
  name: string;
  url: string;
  version: string;
}

export interface SeedGroup {
  id: string;
  name: string;
  path: string;
  parentPath: string;
  checked: string;
  expanded: boolean;
  depth: number;
  treeOrder: number;
}

export interface SeedLayer {
  id: string;
  name: string;
  groupPath: string;
  checked: string;
  visibleInitial: boolean;
  provider: string;
  qgisType: string;
  geometry: string | null;
  wkbType: string | null;
  authid: string | null;
  srsNameFromUri: string | null;
  effectiveSrs: string | null;
  typename: string | null;
  endpointUrl: string | null;
  version: string | null;
  restrictToRequestBBOX: string | null;
  datasourceRaw: string | null;
  fields: string[];
  style: JsonValue | null;
  labeling: JsonValue | null;
  layerOpacity: number | null;
  treeOrder: number;
  drawOrder: number;
}

export interface SeedData {
  author: 'laugis';
  projectCrs: ExtractedProjectCrs;
  initialExtent: ExtractedInitialExtent;
  pluginSpec: JsonValue;
  groups: SeedGroup[];
  layers: SeedLayer[];
}
