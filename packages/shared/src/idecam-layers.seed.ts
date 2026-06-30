import type { ExtractedIdecamData, SeedData, SeedLayer } from './types';

export const IDECAM_EXTRACTED_DATA = {
  "groups": [
    {
      "name": "Capas IGN",
      "path": "Capas IGN",
      "parent": "",
      "checked": "Qt::Checked",
      "expanded": "1",
      "depth": 1
    },
    {
      "name": "INFRAESTRUCTURA ENERGIA",
      "path": "INFRAESTRUCTURA ENERGIA",
      "parent": "",
      "checked": "Qt::Checked",
      "expanded": "1",
      "depth": 1
    },
    {
      "name": "IRRIGACION",
      "path": "IRRIGACION",
      "parent": "",
      "checked": "Qt::Checked",
      "expanded": "1",
      "depth": 1
    },
    {
      "name": "IDECAM – WFS (Demo)",
      "path": "IDECAM – WFS (Demo)",
      "parent": "",
      "checked": "Qt::Checked",
      "expanded": "1",
      "depth": 1
    },
    {
      "name": "AREAS CON SERVICIOS",
      "path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "parent": "IDECAM – WFS (Demo)",
      "checked": "Qt::Unchecked",
      "expanded": "1",
      "depth": 2
    },
    {
      "name": "INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "parent": "IDECAM – WFS (Demo)",
      "checked": "Qt::Unchecked",
      "expanded": "1",
      "depth": 2
    },
    {
      "name": "Parcelarios Municipales",
      "path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "parent": "IDECAM – WFS (Demo)",
      "checked": "Qt::Checked",
      "expanded": "1",
      "depth": 2
    }
  ],
  "layer_tree": [
    {
      "tree_order": 0,
      "id": "ign_cartas_100000_9e95cc44_38a7_4782_9f50_e47d5a96c69e",
      "name": "Cartas 1:100.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 1,
      "id": "ign_cartas_250000_6dbc98aa_ee6b_4a5c_bcca_6a6b552c4d9a",
      "name": "Cartas 1:250.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 2,
      "id": "ign_cartas_50000_a9ad48b8_7a37_493a_af7e_11677d972d99",
      "name": "Cartas 1:50.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 3,
      "id": "ign_cartas_500000_d3173dc7_d118_4b8e_ab4d_5452768fd16a",
      "name": "Cartas 1:500.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 4,
      "id": "geonode_linea_alta_tension_c75a2845_f042_47b7_babd_5bae6fc56865",
      "name": "Lineas de Alta tension EDEMSA",
      "group_path": "INFRAESTRUCTURA ENERGIA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 5,
      "id": "geonode_red_riego_actual_4326_4a86bf8c_7670_4800_911a_8e365057a562",
      "name": "Red de Riego",
      "group_path": "IRRIGACION",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 6,
      "id": "Parcelas_con_derecho_de_riego_8bbed6c9_9962_4da9_8805_54b41d8c705a",
      "name": "Parcelas con derecho de riego",
      "group_path": "IRRIGACION",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 7,
      "id": "geonode_area_servida_cloacas_c11a682a_9125_4d66_8916_7e4a73bd5742",
      "name": "Areas con servicio CLOACAS",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 8,
      "id": "geonode_area_serv_gas_4f031f62_c39a_4bbd_bb42_40cac2a5b163",
      "name": "Areas con servicio GAS",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 9,
      "id": "geonode_area_servida_agua_6f6bab79_4da5_4222_9139_2e6c758722e0",
      "name": "Areas con servicio AGUA",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 10,
      "id": "geonode_area_serv_elect_5f6eccaf_59bb_4e89_ae72_6423d90140f8",
      "name": "Areas con servicio ELECTRICO",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 11,
      "id": "geonode_FRONTERAS_dc5ba94c_dd7e_4f56_b761_506eeb47cffc",
      "name": "Zona de seguridad y fronteras",
      "group_path": "IDECAM – WFS (Demo)",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 12,
      "id": "geonode_MENSURA_VESEP_28e9c9db_f169_4224_ba58_4eb57e2069ec",
      "name": "VESEP",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 13,
      "id": "geonode_MENSURA0_90d8eb63_4cac_4799_976e_774fa0e55915",
      "name": "MENSURA",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 14,
      "id": "geonode_MENSURA_ACTUALIZADA_2aedbf39_a7d8_4bf5_b3d1_03a3b74fef21",
      "name": "ACTUALIZACIÓN",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 15,
      "id": "geonode_MENSURA_UNIFICACION_e82c3c14_886f_4d4c_a38c_0e6197cb10a9",
      "name": "UNIFICACIÓN",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 16,
      "id": "geonode_MENSURA_FRACCIONAMIENTO_f93cd680_d708_4e7d_be7e_389972d37315",
      "name": "FRACCIONAMIENTO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 17,
      "id": "geonode_MENSURA_UNIFICACION_FRACCIONAMIENTO_de12cb95_c6dd_48ea_8c65_b0ff311ff78f",
      "name": "UNIFICACIÓN Y FRACCIONAMIENTO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 18,
      "id": "geonode_MENSURA_TITULO_SUPLETORIO0_59261212_41bf_455d_9c63_b9d0018c4a69",
      "name": "TITULO SUPLETORIO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 19,
      "id": "geonode_MENSURA_SERVIDUMBRE_DUCTO_aa941665_410d_4029_a9d6_528aab86b69a",
      "name": "CONST. SERVIDUMBRE",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 20,
      "id": "geonode_MENSURA_SERVICIO_ELECTRODUCTO_9c7084bc_7fb4_4aab_b1d0_e4eca012f020",
      "name": "SERVICIO ELECTRODUCTO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 21,
      "id": "geonode_MENSURA_PROPIEDAD_HORIZONTAL_7f010eb2_df98_4c4e_b348_e7734a2cef4e",
      "name": "PH",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 22,
      "id": "geonode_MENSURA_PARTE_MAYOR_EXTENSION_048d2b62_651c_4e05_9ea0_d2c0cee5309a",
      "name": "PME",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 23,
      "id": "geonode_MENSURA_LOTEO_72c2b4e7_726c_4b99_bc58_bac561d69b24",
      "name": "LOTEO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 24,
      "id": "geonode_MENSURA_LEY_24374_0c00bed8_139d_47dd_9642_ef25f4ebe230",
      "name": "LEY 24374",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 25,
      "id": "geonode_MENSURA_EXPROPIACION_599d1d2c_b0fe_4260_9dca_05d8b18feb26",
      "name": "EXPROPIACIÓN",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 26,
      "id": "geonode_Parcelas_capital_4326_cc0e9fb2_e25c_4c2f_970a_143cff63aba6",
      "name": "01- Parcelas Capital",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 27,
      "id": "geonode_Parcelas_las_heras_4326_47cf39c8_943f_441e_af43_c43472c5d865",
      "name": "03- Parcelas Las Heras",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 28,
      "id": "geonode_Parcelas_guaymallen_4326_9efd679b_6e72_47fc_9250_65f55fdf891a",
      "name": "04- Parcelas Guaymallen",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 29,
      "id": "geonode_Parcelas_godoy_cruz_4326_a7c19ceb_476f_4b55_8a1a_8dde038c89fd",
      "name": "05- Parcelas Godoy Cruz",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 30,
      "id": "geonode_Parcelas_lujan_4326_b5704562_bebf_4f07_995e_07d4399b967e",
      "name": "06- Parcelas Lujan",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 31,
      "id": "geonode_Parcelas_maipu_4326_27b2841d_5929_4351_a4b8_9934a324a5a1",
      "name": "07- Parcelas Maipu",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 32,
      "id": "geonode_Parcelas_san_martin_4326_6c7179a3_3d68_480d_adb7_198e93d5cef6",
      "name": "08- Parcelas San Martin",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 33,
      "id": "geonode_Parcelas_junin_4326_db0c755b_a4bd_4989_be29_72be044544cf",
      "name": "09- Parcelas Junin",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 34,
      "id": "geonode_Parcelas_rivadavia_4326_642fc8f9_7704_430b_9ab6_5f44dc3c2b12",
      "name": "10- Parcelas Rivadavia",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 35,
      "id": "geonode_Parcelas_santa_rosa_4326_58f66659_0a74_487c_8d41_e8c11959c316",
      "name": "11- Parcelas Santa Rosa",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 36,
      "id": "geonode_Parcelas_la_paz_4326_db48e3f0_69a7_4a58_96f0_5d74140bf482",
      "name": "12- Parcelas La Paz",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 37,
      "id": "geonode_Parcelas_lavalle_4326_4b542d76_a2e5_45bb_8509_aaf614172564",
      "name": "13- Parcelas Lavalle",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 38,
      "id": "geonode_Parcelas_tupungato_4326_d2e6d877_6083_4090_a0b4_cb0cbfd04755",
      "name": "14- Parcelas Tupungato",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 39,
      "id": "geonode_Parcelas_tunuyan_4326_a34738c8_3cb5_4c75_b0d8_35e3b1a589d0",
      "name": "15- Parcelas Tunuyan",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 40,
      "id": "geonode_Parcelas_san_carlos_4326_45553aa4_fb61_4bfc_ae35_bbfe37630b06",
      "name": "16- Parcelas San Carlos",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 41,
      "id": "geonode_Parcelas_general_alvear_4326_70e8ebd4_0ed4_4e6d_8426_ec76a6d88c56",
      "name": "18- Parcelas General Alvear",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 42,
      "id": "geonode_Parcelas_san_rafael_4326_5834358c_fc8c_4297_97c3_58869d67b922",
      "name": "17- Parcelas San Rafael",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 43,
      "id": "geonode_Parcelas_malargue_4326_ce2ba643_1d67_4eb4_813d_be7d7b4d159b",
      "name": "19- Parcelas Malargue",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "expanded": "1"
    },
    {
      "tree_order": 44,
      "id": "geonode_distritos_mendoza_epsg4326_a476bb3e_b06b_4ee3_a05b_5cd9d23d160a",
      "name": "Distritos de Mendoza",
      "group_path": "IDECAM – WFS (Demo)",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    },
    {
      "tree_order": 45,
      "id": "Google_Satellite_Hybrid_f9b3fd1e_4657_40b6_abd4_62532b57d47b",
      "name": "Google Satellite Hybrid",
      "group_path": "",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "expanded": "1"
    }
  ],
  "layers": [
    {
      "tree_order": 0,
      "draw_order_qgis_layerorder": 28,
      "id": "ign_cartas_100000_9e95cc44_38a7_4782_9f50_e47d5a96c69e",
      "name": "Cartas 1:100.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "ign:cartas_100000",
      "endpoint_url": "https://wms.ign.gob.ar/geoserver/ows",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='ign:cartas_100000' url='https://wms.ign.gob.ar/geoserver/ows' version='auto'",
      "fields": [
        "gid",
        "carac",
        "nombre",
        "num_faja",
        "fecha_edic",
        "meridiano_",
        "elipsoide",
        "fecha_lev_",
        "tipo_lev_c",
        "marco_de_r",
        "sist_de_pr"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,255,255,255,rgb:1,1,1,1",
              "outline_color": "0,0,0,255,rgb:0,0,0,1",
              "outline_width": "0.66",
              "outline_style": "solid",
              "name": "",
              "style": "no",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,255,255,255,rgb:1,1,1,1",
                "rgba": "rgba(255,255,255,1.000)",
                "hex": "#ffffff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "0,0,0,255,rgb:0,0,0,1",
                "rgba": "rgba(0,0,0,1.000)",
                "hex": "#000000",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": {
        "enabled": true,
        "fieldName": "carac",
        "fontFamily": "Open Sans",
        "fontSize": "10",
        "textColor": {
          "raw": "50,50,50,255,rgb:0.19607843137254902,0.19607843137254902,0.19607843137254902,1",
          "rgba": "rgba(50,50,50,1.000)",
          "hex": "#323232",
          "opacity": 1.0
        },
        "bufferDraw": "1",
        "bufferColor": {
          "raw": "250,250,250,255,rgb:0.98039215686274506,0.98039215686274506,0.98039215686274506,1",
          "rgba": "rgba(250,250,250,1.000)",
          "hex": "#fafafa",
          "opacity": 1.0
        },
        "bufferSize": "1"
      },
      "layerOpacity": "1"
    },
    {
      "tree_order": 1,
      "draw_order_qgis_layerorder": 29,
      "id": "ign_cartas_250000_6dbc98aa_ee6b_4a5c_bcca_6a6b552c4d9a",
      "name": "Cartas 1:250.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "ign:cartas_250000",
      "endpoint_url": "https://wms.ign.gob.ar/geoserver/ows",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='ign:cartas_250000' url='https://wms.ign.gob.ar/geoserver/ows' version='auto'",
      "fields": [
        "gid",
        "carac",
        "nombre",
        "num_faja",
        "fecha_edic",
        "meridiano_",
        "elipsoide",
        "fecha_lev_",
        "tipo_lev_c",
        "marco_de_r",
        "sist_de_pr"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,255,255,255,rgb:1,1,1,1",
              "outline_color": "0,0,0,255,rgb:0,0,0,1",
              "outline_width": "0.66",
              "outline_style": "solid",
              "name": "",
              "style": "no",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,255,255,255,rgb:1,1,1,1",
                "rgba": "rgba(255,255,255,1.000)",
                "hex": "#ffffff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "0,0,0,255,rgb:0,0,0,1",
                "rgba": "rgba(0,0,0,1.000)",
                "hex": "#000000",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": {
        "enabled": true,
        "fieldName": "carac",
        "fontFamily": "Open Sans",
        "fontSize": "10",
        "textColor": {
          "raw": "50,50,50,255,rgb:0.19607843137254902,0.19607843137254902,0.19607843137254902,1",
          "rgba": "rgba(50,50,50,1.000)",
          "hex": "#323232",
          "opacity": 1.0
        },
        "bufferDraw": "1",
        "bufferColor": {
          "raw": "250,250,250,255,rgb:0.98039215686274506,0.98039215686274506,0.98039215686274506,1",
          "rgba": "rgba(250,250,250,1.000)",
          "hex": "#fafafa",
          "opacity": 1.0
        },
        "bufferSize": "1"
      },
      "layerOpacity": "1"
    },
    {
      "tree_order": 2,
      "draw_order_qgis_layerorder": 30,
      "id": "ign_cartas_50000_a9ad48b8_7a37_493a_af7e_11677d972d99",
      "name": "Cartas 1:50.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "ign:cartas_50000",
      "endpoint_url": "https://wms.ign.gob.ar/geoserver/ows",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='ign:cartas_50000' url='https://wms.ign.gob.ar/geoserver/ows' version='auto'",
      "fields": [
        "gid",
        "carac",
        "nombre",
        "num_faja",
        "fecha_edic",
        "meridiano_",
        "elipsoide",
        "fecha_lev_",
        "tipo_lev_c",
        "marco_de_r",
        "sist_de_pr"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,255,255,255,rgb:1,1,1,1",
              "outline_color": "0,0,0,255,rgb:0,0,0,1",
              "outline_width": "0.66",
              "outline_style": "solid",
              "name": "",
              "style": "no",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,255,255,255,rgb:1,1,1,1",
                "rgba": "rgba(255,255,255,1.000)",
                "hex": "#ffffff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "0,0,0,255,rgb:0,0,0,1",
                "rgba": "rgba(0,0,0,1.000)",
                "hex": "#000000",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": {
        "enabled": true,
        "fieldName": "carac",
        "fontFamily": "Open Sans",
        "fontSize": "10",
        "textColor": {
          "raw": "50,50,50,255,rgb:0.19607843137254902,0.19607843137254902,0.19607843137254902,1",
          "rgba": "rgba(50,50,50,1.000)",
          "hex": "#323232",
          "opacity": 1.0
        },
        "bufferDraw": "1",
        "bufferColor": {
          "raw": "250,250,250,255,rgb:0.98039215686274506,0.98039215686274506,0.98039215686274506,1",
          "rgba": "rgba(250,250,250,1.000)",
          "hex": "#fafafa",
          "opacity": 1.0
        },
        "bufferSize": "1"
      },
      "layerOpacity": "1"
    },
    {
      "tree_order": 3,
      "draw_order_qgis_layerorder": 31,
      "id": "ign_cartas_500000_d3173dc7_d118_4b8e_ab4d_5452768fd16a",
      "name": "Cartas 1:500.000",
      "group_path": "Capas IGN",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "ign:cartas_500000",
      "endpoint_url": "https://wms.ign.gob.ar/geoserver/ows",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='ign:cartas_500000' url='https://wms.ign.gob.ar/geoserver/ows' version='auto'",
      "fields": [
        "gid",
        "carac",
        "nombre",
        "num_faja",
        "fecha_edic",
        "meridiano_",
        "elipsoide",
        "fecha_lev_",
        "tipo_lev_c",
        "marco_de_r",
        "sist_de_pr"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,255,255,255,rgb:1,1,1,1",
              "outline_color": "0,0,0,255,rgb:0,0,0,1",
              "outline_width": "0.66",
              "outline_style": "solid",
              "name": "",
              "style": "no",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,255,255,255,rgb:1,1,1,1",
                "rgba": "rgba(255,255,255,1.000)",
                "hex": "#ffffff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "0,0,0,255,rgb:0,0,0,1",
                "rgba": "rgba(0,0,0,1.000)",
                "hex": "#000000",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": {
        "enabled": true,
        "fieldName": "carac",
        "fontFamily": "Open Sans",
        "fontSize": "10",
        "textColor": {
          "raw": "50,50,50,255,rgb:0.19607843137254902,0.19607843137254902,0.19607843137254902,1",
          "rgba": "rgba(50,50,50,1.000)",
          "hex": "#323232",
          "opacity": 1.0
        },
        "bufferDraw": "1",
        "bufferColor": {
          "raw": "250,250,250,255,rgb:0.98039215686274506,0.98039215686274506,0.98039215686274506,1",
          "rgba": "rgba(250,250,250,1.000)",
          "hex": "#fafafa",
          "opacity": 1.0
        },
        "bufferSize": "1"
      },
      "layerOpacity": "1"
    },
    {
      "tree_order": 4,
      "draw_order_qgis_layerorder": 8,
      "id": "geonode_linea_alta_tension_c75a2845_f042_47b7_babd_5bae6fc56865",
      "name": "Lineas de Alta tension EDEMSA",
      "group_path": "INFRAESTRUCTURA ENERGIA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Line",
      "wkbType": "MultiLineString",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:linea_alta_tension",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:4326' typename='geonode:linea_alta_tension' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid",
        "NOMBRE",
        "ID",
        "TENSION",
        "FASES",
        "SECCION",
        "MATERIAL",
        "FECHA_PUES",
        "PROPIEDAD",
        "CONCESION",
        "depto"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "line",
        "alpha": 0.555,
        "layers": [
          {
            "class": "SimpleLine",
            "enabled": "1",
            "options": {
              "line_color": "255,122,0,255,hsv:0.08005555555555556,1,1,1",
              "line_width": "5.6",
              "line_style": "solid",
              "name": "",
              "joinstyle": "bevel",
              "capstyle": "square",
              "offset": "0",
              "line_color_parsed": {
                "raw": "255,122,0,255,hsv:0.08005555555555556,1,1,1",
                "rgba": "rgba(255,122,0,1.000)",
                "hex": "#ff7a00",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 5,
      "draw_order_qgis_layerorder": 2,
      "id": "geonode_red_riego_actual_4326_4a86bf8c_7670_4800_911a_8e365057a562",
      "name": "Red de Riego",
      "group_path": "IRRIGACION",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Line",
      "wkbType": "MultiLineString",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:red_riego_actual_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:4326' typename='geonode:red_riego_actual_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "gid",
        "codcau",
        "categoria",
        "material",
        "estado",
        "long_m",
        "cauce",
        "jerarquia",
        "inspeccion",
        "cod_distri"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "line",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleLine",
            "enabled": "1",
            "options": {
              "line_color": "0,117,252,255,hsv:0.58938888888888885,1,0.98860151064316781,1",
              "line_width": "1.26",
              "line_style": "solid",
              "name": "",
              "joinstyle": "bevel",
              "capstyle": "square",
              "offset": "0",
              "line_color_parsed": {
                "raw": "0,117,252,255,hsv:0.58938888888888885,1,0.98860151064316781,1",
                "rgba": "rgba(0,117,252,1.000)",
                "hex": "#0075fc",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 6,
      "draw_order_qgis_layerorder": 0,
      "id": "Parcelas_con_derecho_de_riego_8bbed6c9_9962_4da9_8805_54b41d8c705a",
      "name": "Parcelas con derecho de riego",
      "group_path": "IRRIGACION",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": null,
      "effective_srs": "EPSG:4326",
      "typename": "geonode:parcelario_irrigado_epsg4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "1.1.0",
      "restrictToRequestBBOX": null,
      "datasource_raw": "typename=geonode:parcelario_irrigado_epsg4326 url=https://geonode-cam.marketsis.com.ar/geoserver/wfs version=1.1.0",
      "fields": [
        "fid_1",
        "fid",
        "nomenclatu",
        "ZONA"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.218,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "0,255,212,255,hsv:0.47194444444444444,1,1,1",
              "outline_color": "34,34,34,255,rgb:0.13333333333333333,0.13333333333333333,0.13333333333333333,1",
              "outline_width": "0.22",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "0,255,212,255,hsv:0.47194444444444444,1,1,1",
                "rgba": "rgba(0,255,212,1.000)",
                "hex": "#00ffd4",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "34,34,34,255,rgb:0.13333333333333333,0.13333333333333333,0.13333333333333333,1",
                "rgba": "rgba(34,34,34,1.000)",
                "hex": "#222222",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 7,
      "draw_order_qgis_layerorder": 4,
      "id": "geonode_area_servida_cloacas_c11a682a_9125_4d66_8916_7e4a73bd5742",
      "name": "Areas con servicio CLOACAS",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:22172",
      "srsname_from_uri": "EPSG:22172",
      "effective_srs": "EPSG:22172",
      "typename": "geonode:area_servida_cloacas",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:22172' typename='geonode:area_servida_cloacas' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "id",
        "fid"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.309,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "145,82,45,255,rgb:0.56862745098039214,0.32156862745098042,0.17647058823529413,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.86",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "145,82,45,255,rgb:0.56862745098039214,0.32156862745098042,0.17647058823529413,1",
                "rgba": "rgba(145,82,45,1.000)",
                "hex": "#91522d",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 8,
      "draw_order_qgis_layerorder": 6,
      "id": "geonode_area_serv_gas_4f031f62_c39a_4bbd_bb42_40cac2a5b163",
      "name": "Areas con servicio GAS",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:22172",
      "srsname_from_uri": "EPSG:22172",
      "effective_srs": "EPSG:22172",
      "typename": "geonode:area_serv_gas",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:22172' typename='geonode:area_serv_gas' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "id",
        "fid"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.269,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "152,125,183,255,rgb:0.59607843137254901,0.49019607843137253,0.71764705882352942,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "1.06",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "152,125,183,255,rgb:0.59607843137254901,0.49019607843137253,0.71764705882352942,1",
                "rgba": "rgba(152,125,183,1.000)",
                "hex": "#987db7",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 9,
      "draw_order_qgis_layerorder": 5,
      "id": "geonode_area_servida_agua_6f6bab79_4da5_4222_9139_2e6c758722e0",
      "name": "Areas con servicio AGUA",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:22172",
      "srsname_from_uri": "EPSG:22172",
      "effective_srs": "EPSG:22172",
      "typename": "geonode:area_servida_agua",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:22172' typename='geonode:area_servida_agua' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "id",
        "fid"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.302,
        "layers": [
          {
            "class": "GradientFill",
            "enabled": "1",
            "options": {
              "color": "47,110,158,255,rgb:0.18431372549019609,0.43137254901960786,0.61960784313725492,1",
              "name": "",
              "offset": "0,0",
              "color_parsed": {
                "raw": "47,110,158,255,rgb:0.18431372549019609,0.43137254901960786,0.61960784313725492,1",
                "rgba": "rgba(47,110,158,1.000)",
                "hex": "#2f6e9e",
                "opacity": 1.0
              }
            }
          },
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "55,126,184,255,rgb:0.21568627450980393,0.49411764705882355,0.72156862745098038,1",
              "outline_color": "0,0,0,255,hsv:0.57222222222222219,0,0,1",
              "outline_width": "0.86",
              "outline_style": "solid",
              "name": "",
              "style": "no",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "55,126,184,255,rgb:0.21568627450980393,0.49411764705882355,0.72156862745098038,1",
                "rgba": "rgba(55,126,184,1.000)",
                "hex": "#377eb8",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "0,0,0,255,hsv:0.57222222222222219,0,0,1",
                "rgba": "rgba(0,0,0,1.000)",
                "hex": "#000000",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 10,
      "draw_order_qgis_layerorder": 7,
      "id": "geonode_area_serv_elect_5f6eccaf_59bb_4e89_ae72_6423d90140f8",
      "name": "Areas con servicio ELECTRICO",
      "group_path": "IDECAM – WFS (Demo) / AREAS CON SERVICIOS",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:22172",
      "srsname_from_uri": "EPSG:22172",
      "effective_srs": "EPSG:22172",
      "typename": "geonode:area_serv_elect",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:22172' typename='geonode:area_serv_elect' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "id",
        "fid"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.237,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "0,255,228,255,hsv:0.48222222222222222,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "1.06",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "0,255,228,255,hsv:0.48222222222222222,1,1,1",
                "rgba": "rgba(0,255,228,1.000)",
                "hex": "#00ffe4",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 11,
      "draw_order_qgis_layerorder": 9,
      "id": "geonode_FRONTERAS_dc5ba94c_dd7e_4f56_b761_506eeb47cffc",
      "name": "Zona de seguridad y fronteras",
      "group_path": "IDECAM – WFS (Demo)",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:22172",
      "srsname_from_uri": "EPSG:22172",
      "effective_srs": "EPSG:22172",
      "typename": "geonode:FRONTERAS",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:22172' typename='geonode:FRONTERAS' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid",
        "LEY_NACION",
        "LEY_PROV"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.7,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "125,139,143,255,rgb:0.49019607843137253,0.54509803921568623,0.5607843137254902,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "125,139,143,255,rgb:0.49019607843137253,0.54509803921568623,0.5607843137254902,1",
                "rgba": "rgba(125,139,143,1.000)",
                "hex": "#7d8b8f",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 12,
      "draw_order_qgis_layerorder": 45,
      "id": "geonode_MENSURA_VESEP_28e9c9db_f169_4224_ba58_4eb57e2069ec",
      "name": "VESEP",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_VESEP",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_VESEP' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "0,162,255,255,hsv:0.56055555555555558,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "0,162,255,255,hsv:0.56055555555555558,1,1,1",
                "rgba": "rgba(0,162,255,1.000)",
                "hex": "#00a2ff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 13,
      "draw_order_qgis_layerorder": 32,
      "id": "geonode_MENSURA0_90d8eb63_4cac_4799_976e_774fa0e55915",
      "name": "MENSURA",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA0",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA0' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "190,190,190,255,hsv:0.14050000000000001,0,0.74662394140535593,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "190,190,190,255,hsv:0.14050000000000001,0,0.74662394140535593,1",
                "rgba": "rgba(190,190,190,1.000)",
                "hex": "#bebebe",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 14,
      "draw_order_qgis_layerorder": 33,
      "id": "geonode_MENSURA_ACTUALIZADA_2aedbf39_a7d8_4bf5_b3d1_03a3b74fef21",
      "name": "ACTUALIZACIÓN",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_ACTUALIZADA",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_ACTUALIZADA' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "255,226,36,255,rgb:1,0.88442816815442127,0.13966582742046235,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "255,226,36,255,rgb:1,0.88442816815442127,0.13966582742046235,1",
                "rgba": "rgba(255,226,36,1.000)",
                "hex": "#ffe224",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 15,
      "draw_order_qgis_layerorder": 43,
      "id": "geonode_MENSURA_UNIFICACION_e82c3c14_886f_4d4c_a38c_0e6197cb10a9",
      "name": "UNIFICACIÓN",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_UNIFICACION",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_UNIFICACION' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "117,33,154,255,hsv:0.78172222222222221,0.78484779125658044,0.60476081483176924,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "117,33,154,255,hsv:0.78172222222222221,0.78484779125658044,0.60476081483176924,1",
                "rgba": "rgba(117,33,154,1.000)",
                "hex": "#75219a",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 16,
      "draw_order_qgis_layerorder": 35,
      "id": "geonode_MENSURA_FRACCIONAMIENTO_f93cd680_d708_4e7d_be7e_389972d37315",
      "name": "FRACCIONAMIENTO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_FRACCIONAMIENTO",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_FRACCIONAMIENTO' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "236,53,207,255,hsv:0.85988888888888892,0.77503624017700468,0.92585641260395213,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "236,53,207,255,hsv:0.85988888888888892,0.77503624017700468,0.92585641260395213,1",
                "rgba": "rgba(236,53,207,1.000)",
                "hex": "#ec35cf",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 17,
      "draw_order_qgis_layerorder": 44,
      "id": "geonode_MENSURA_UNIFICACION_FRACCIONAMIENTO_de12cb95_c6dd_48ea_8c65_b0ff311ff78f",
      "name": "UNIFICACIÓN Y FRACCIONAMIENTO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_UNIFICACION_FRACCIONAMIENTO",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_UNIFICACION_FRACCIONAMIENTO' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "171,30,219,255,hsv:0.79063888888888889,0.86301976043335626,0.85882352941176465,1",
              "outline_color": "0,0,0,255,hsv:0.98799999999999999,0.86718547341115437,0,1",
              "outline_width": "0.2",
              "outline_style": "solid",
              "size": "3",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "171,30,219,255,hsv:0.79063888888888889,0.86301976043335626,0.85882352941176465,1",
                "rgba": "rgba(171,30,219,1.000)",
                "hex": "#ab1edb",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "0,0,0,255,hsv:0.98799999999999999,0.86718547341115437,0,1",
                "rgba": "rgba(0,0,0,1.000)",
                "hex": "#000000",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 18,
      "draw_order_qgis_layerorder": 42,
      "id": "geonode_MENSURA_TITULO_SUPLETORIO0_59261212_41bf_455d_9c63_b9d0018c4a69",
      "name": "TITULO SUPLETORIO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_TITULO_SUPLETORIO0",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_TITULO_SUPLETORIO0' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "242,130,0,255,hsv:0.08947222222222222,1,0.94889753566796364,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "242,130,0,255,hsv:0.08947222222222222,1,0.94889753566796364,1",
                "rgba": "rgba(242,130,0,1.000)",
                "hex": "#f28200",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 19,
      "draw_order_qgis_layerorder": 41,
      "id": "geonode_MENSURA_SERVIDUMBRE_DUCTO_aa941665_410d_4029_a9d6_528aab86b69a",
      "name": "CONST. SERVIDUMBRE",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_SERVIDUMBRE_DUCTO",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_SERVIDUMBRE_DUCTO' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "216,31,7,255,hsv:0.01883333333333333,0.96585030899519342,0.84534981307698176,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "216,31,7,255,hsv:0.01883333333333333,0.96585030899519342,0.84534981307698176,1",
                "rgba": "rgba(216,31,7,1.000)",
                "hex": "#d81f07",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 20,
      "draw_order_qgis_layerorder": 40,
      "id": "geonode_MENSURA_SERVICIO_ELECTRODUCTO_9c7084bc_7fb4_4aab_b1d0_e4eca012f020",
      "name": "SERVICIO ELECTRODUCTO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_SERVICIO_ELECTRODUCTO",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_SERVICIO_ELECTRODUCTO' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "17,255,0,255,hsv:0.32197222222222222,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "17,255,0,255,hsv:0.32197222222222222,1,1,1",
                "rgba": "rgba(17,255,0,1.000)",
                "hex": "#11ff00",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 21,
      "draw_order_qgis_layerorder": 39,
      "id": "geonode_MENSURA_PROPIEDAD_HORIZONTAL_7f010eb2_df98_4c4e_b348_e7734a2cef4e",
      "name": "PH",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_PROPIEDAD_HORIZONTAL",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_PROPIEDAD_HORIZONTAL' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "0,255,254,255,hsv:0.49927777777777776,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "0,255,254,255,hsv:0.49927777777777776,1,1,1",
                "rgba": "rgba(0,255,254,1.000)",
                "hex": "#00fffe",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 22,
      "draw_order_qgis_layerorder": 38,
      "id": "geonode_MENSURA_PARTE_MAYOR_EXTENSION_048d2b62_651c_4e05_9ea0_d2c0cee5309a",
      "name": "PME",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_PARTE_MAYOR_EXTENSION",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_PARTE_MAYOR_EXTENSION' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "143,81,0,255,hsv:0.09405555555555556,1,0.5607843137254902,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "143,81,0,255,hsv:0.09405555555555556,1,0.5607843137254902,1",
                "rgba": "rgba(143,81,0,1.000)",
                "hex": "#8f5100",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 23,
      "draw_order_qgis_layerorder": 37,
      "id": "geonode_MENSURA_LOTEO_72c2b4e7_726c_4b99_bc58_bac561d69b24",
      "name": "LOTEO",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_LOTEO",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_LOTEO' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "255,0,112,255,hsv:0.92669444444444449,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "255,0,112,255,hsv:0.92669444444444449,1,1,1",
                "rgba": "rgba(255,0,112,1.000)",
                "hex": "#ff0070",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 24,
      "draw_order_qgis_layerorder": 36,
      "id": "geonode_MENSURA_LEY_24374_0c00bed8_139d_47dd_9642_ef25f4ebe230",
      "name": "LEY 24374",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_LEY_24374",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_LEY_24374' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "189,229,54,255,hsv:0.20458333333333334,0.76418707560845345,0.89803921568627454,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "189,229,54,255,hsv:0.20458333333333334,0.76418707560845345,0.89803921568627454,1",
                "rgba": "rgba(189,229,54,1.000)",
                "hex": "#bde536",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 25,
      "draw_order_qgis_layerorder": 34,
      "id": "geonode_MENSURA_EXPROPIACION_599d1d2c_b0fe_4260_9dca_05d8b18feb26",
      "name": "EXPROPIACIÓN",
      "group_path": "IDECAM – WFS (Demo) / INTERVENCIONES CAM - OBJETOS DE MENSURA",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Point",
      "wkbType": "Point",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:MENSURA_EXPROPIACION",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:MENSURA_EXPROPIACION' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Zona",
        "Uso_inmueb",
        "SUPERFICIE",
        "SUPERFIC_1",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_",
        "delegacion",
        "objeto",
        "anio",
        "Lat",
        "Long"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "marker",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleMarker",
            "enabled": "1",
            "options": {
              "color": "255,205,241,255,rgb:1,0.80401312275883119,0.94471656366826884,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0",
              "outline_style": "solid",
              "size": "2",
              "name": "",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "size_unit": "MM",
              "color_parsed": {
                "raw": "255,205,241,255,rgb:1,0.80401312275883119,0.94471656366826884,1",
                "rgba": "rgba(255,205,241,1.000)",
                "hex": "#ffcdf1",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 26,
      "draw_order_qgis_layerorder": 10,
      "id": "geonode_Parcelas_capital_4326_cc0e9fb2_e25c_4c2f_970a_143cff63aba6",
      "name": "01- Parcelas Capital",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_capital_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_capital_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "0,255,255,255,rgb:0,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "0,255,255,255,rgb:0,1,1,1",
                "rgba": "rgba(0,255,255,1.000)",
                "hex": "#00ffff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 27,
      "draw_order_qgis_layerorder": 16,
      "id": "geonode_Parcelas_las_heras_4326_47cf39c8_943f_441e_af43_c43472c5d865",
      "name": "03- Parcelas Las Heras",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_las_heras_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_las_heras_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,137,252,255,hsv:0.83808333333333329,0.46315709163042651,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,137,252,255,hsv:0.83808333333333329,0.46315709163042651,1,1",
                "rgba": "rgba(255,137,252,1.000)",
                "hex": "#ff89fc",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 28,
      "draw_order_qgis_layerorder": 13,
      "id": "geonode_Parcelas_guaymallen_4326_9efd679b_6e72_47fc_9250_65f55fdf891a",
      "name": "04- Parcelas Guaymallen",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_guaymallen_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_guaymallen_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "161,0,255,255,rgb:0.63317311360341799,0,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "161,0,255,255,rgb:0.63317311360341799,0,1,1",
                "rgba": "rgba(161,0,255,1.000)",
                "hex": "#a100ff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 29,
      "draw_order_qgis_layerorder": 12,
      "id": "geonode_Parcelas_godoy_cruz_4326_a7c19ceb_476f_4b55_8a1a_8dde038c89fd",
      "name": "05- Parcelas Godoy Cruz",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_godoy_cruz_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_godoy_cruz_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "0,94,255,255,rgb:0,0.36682688639658195,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "0,94,255,255,rgb:0,0.36682688639658195,1,1",
                "rgba": "rgba(0,94,255,1.000)",
                "hex": "#005eff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 30,
      "draw_order_qgis_layerorder": 18,
      "id": "geonode_Parcelas_lujan_4326_b5704562_bebf_4f07_995e_07d4399b967e",
      "name": "06- Parcelas Lujan",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_lujan_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_lujan_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,255,37,255,rgb:1,1,0.14572365911345084,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,255,37,255,rgb:1,1,0.14572365911345084,1",
                "rgba": "rgba(255,255,37,1.000)",
                "hex": "#ffff25",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 31,
      "draw_order_qgis_layerorder": 19,
      "id": "geonode_Parcelas_maipu_4326_27b2841d_5929_4351_a4b8_9934a324a5a1",
      "name": "07- Parcelas Maipu",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_maipu_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_maipu_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,67,0,255,rgb:1,0.26131074998092624,0,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,67,0,255,rgb:1,0.26131074998092624,0,1",
                "rgba": "rgba(255,67,0,1.000)",
                "hex": "#ff4300",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 32,
      "draw_order_qgis_layerorder": 23,
      "id": "geonode_Parcelas_san_martin_4326_6c7179a3_3d68_480d_adb7_198e93d5cef6",
      "name": "08- Parcelas San Martin",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_san_martin_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_san_martin_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "179,12,27,255,hsv:0.98583333333333334,0.93098344396124211,0.70179293507286178,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "179,12,27,255,hsv:0.98583333333333334,0.93098344396124211,0.70179293507286178,1",
                "rgba": "rgba(179,12,27,1.000)",
                "hex": "#b30c1b",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 33,
      "draw_order_qgis_layerorder": 14,
      "id": "geonode_Parcelas_junin_4326_db0c755b_a4bd_4989_be29_72be044544cf",
      "name": "09- Parcelas Junin",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_junin_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_junin_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "10,255,0,255,hsv:0.32691666666666669,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "10,255,0,255,hsv:0.32691666666666669,1,1,1",
                "rgba": "rgba(10,255,0,1.000)",
                "hex": "#0aff00",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 34,
      "draw_order_qgis_layerorder": 21,
      "id": "geonode_Parcelas_rivadavia_4326_642fc8f9_7704_430b_9ab6_5f44dc3c2b12",
      "name": "10- Parcelas Rivadavia",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_rivadavia_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_rivadavia_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,144,0,255,hsv:0.09402777777777778,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,144,0,255,hsv:0.09402777777777778,1,1,1",
                "rgba": "rgba(255,144,0,1.000)",
                "hex": "#ff9000",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 35,
      "draw_order_qgis_layerorder": 24,
      "id": "geonode_Parcelas_santa_rosa_4326_58f66659_0a74_487c_8d41_e8c11959c316",
      "name": "11- Parcelas Santa Rosa",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_santa_rosa_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_santa_rosa_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "239,186,136,255,hsv:0.08186111111111111,0.43158617532616161,0.93684290836957351,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "239,186,136,255,hsv:0.08186111111111111,0.43158617532616161,0.93684290836957351,1",
                "rgba": "rgba(239,186,136,1.000)",
                "hex": "#efba88",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 36,
      "draw_order_qgis_layerorder": 15,
      "id": "geonode_Parcelas_la_paz_4326_db48e3f0_69a7_4a58_96f0_5d74140bf482",
      "name": "12- Parcelas La Paz",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_la_paz_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_la_paz_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "183,255,0,255,hsv:0.21394444444444444,1,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "183,255,0,255,hsv:0.21394444444444444,1,1,1",
                "rgba": "rgba(183,255,0,1.000)",
                "hex": "#b7ff00",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 37,
      "draw_order_qgis_layerorder": 17,
      "id": "geonode_Parcelas_lavalle_4326_4b542d76_a2e5_45bb_8509_aaf614172564",
      "name": "13- Parcelas Lavalle",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_lavalle_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_lavalle_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,207,197,255,rgb:1,0.81002517738612956,0.77387655451285575,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,207,197,255,rgb:1,0.81002517738612956,0.77387655451285575,1",
                "rgba": "rgba(255,207,197,1.000)",
                "hex": "#ffcfc5",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 38,
      "draw_order_qgis_layerorder": 26,
      "id": "geonode_Parcelas_tupungato_4326_d2e6d877_6083_4090_a0b4_cb0cbfd04755",
      "name": "14- Parcelas Tupungato",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_tupungato_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_tupungato_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "255,255,212,255,hsv:0.16666666666666666,0.16841382467383842,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "255,255,212,255,hsv:0.16666666666666666,0.16841382467383842,1,1",
                "rgba": "rgba(255,255,212,1.000)",
                "hex": "#ffffd4",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 39,
      "draw_order_qgis_layerorder": 25,
      "id": "geonode_Parcelas_tunuyan_4326_a34738c8_3cb5_4c75_b0d8_35e3b1a589d0",
      "name": "15- Parcelas Tunuyan",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_tunuyan_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_tunuyan_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "209,255,254,255,rgb:0.8190890363927672,1,0.99450675211718931,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "209,255,254,255,rgb:0.8190890363927672,1,0.99450675211718931,1",
                "rgba": "rgba(209,255,254,1.000)",
                "hex": "#d1fffe",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 40,
      "draw_order_qgis_layerorder": 22,
      "id": "geonode_Parcelas_san_carlos_4326_45553aa4_fb61_4bfc_ae35_bbfe37630b06",
      "name": "16- Parcelas San Carlos",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_san_carlos_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_san_carlos_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "0,129,255,255,rgb:0,0.50753032730601966,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "0,129,255,255,rgb:0,0.50753032730601966,1,1",
                "rgba": "rgba(0,129,255,1.000)",
                "hex": "#0081ff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 41,
      "draw_order_qgis_layerorder": 11,
      "id": "geonode_Parcelas_general_alvear_4326_70e8ebd4_0ed4_4e6d_8426_ec76a6d88c56",
      "name": "18- Parcelas General Alvear",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_general_alvear_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_general_alvear_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "127,23,255,255,rgb:0.49748989089799345,0.09019607843137255,1,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "127,23,255,255,rgb:0.49748989089799345,0.09019607843137255,1,1",
                "rgba": "rgba(127,23,255,1.000)",
                "hex": "#7f17ff",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 42,
      "draw_order_qgis_layerorder": 27,
      "id": "geonode_Parcelas_san_rafael_4326_5834358c_fc8c_4297_97c3_58869d67b922",
      "name": "17- Parcelas San Rafael",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_san_rafael_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_san_rafael_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.315,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "212,181,133,255,hsv:0.10136111111111111,0.37186236362249181,0.83158617532616164,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "212,181,133,255,hsv:0.10136111111111111,0.37186236362249181,0.83158617532616164,1",
                "rgba": "rgba(212,181,133,1.000)",
                "hex": "#d4b585",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 43,
      "draw_order_qgis_layerorder": 20,
      "id": "geonode_Parcelas_malargue_4326_ce2ba643_1d67_4eb4_813d_be7d7b4d159b",
      "name": "19- Parcelas Malargue",
      "group_path": "IDECAM – WFS (Demo) / Parcelarios Municipales",
      "checked": "Qt::Unchecked",
      "visible_initial": false,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:Parcelas_malargue_4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": null,
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' srsname='EPSG:4326' typename='geonode:Parcelas_malargue_4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid_1",
        "fid",
        "Nomenclatu",
        "Padron_ren",
        "Padron_mun",
        "Zona",
        "Plano_nro",
        "Uso_inmueb",
        "Calle",
        "Puerta_nro",
        "Piso_numer",
        "Dpto_numer",
        "Barrio_nom",
        "Lote_numer",
        "MANZANA",
        "SUPERFICIE",
        "SUPERFIC_1",
        "AVALUO_TER",
        "AVALUO_MEJ",
        "AVALUO_TOT",
        "NOMENCLA_1",
        "Folio_nro",
        "Tomo_nro",
        "Folio_real",
        "Asiento",
        "Matricula_",
        "Departamen",
        "Tipo_der_r",
        "CC_PP_rieg",
        "Uso_riego",
        "Sup_empad_"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 0.515,
        "layers": [
          {
            "class": "SimpleFill",
            "enabled": "1",
            "options": {
              "color": "181,105,88,255,hsv:0.03116666666666667,0.51558709086747534,0.71035324635690855,1",
              "outline_color": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
              "outline_width": "0.26",
              "outline_style": "solid",
              "name": "",
              "style": "solid",
              "joinstyle": "bevel",
              "offset": "0,0",
              "outline_width_unit": "MM",
              "color_parsed": {
                "raw": "181,105,88,255,hsv:0.03116666666666667,0.51558709086747534,0.71035324635690855,1",
                "rgba": "rgba(181,105,88,1.000)",
                "hex": "#b56958",
                "opacity": 1.0
              },
              "outline_color_parsed": {
                "raw": "35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1",
                "rgba": "rgba(35,35,35,1.000)",
                "hex": "#232323",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 44,
      "draw_order_qgis_layerorder": 3,
      "id": "geonode_distritos_mendoza_epsg4326_a476bb3e_b06b_4ee3_a05b_5cd9d23d160a",
      "name": "Distritos de Mendoza",
      "group_path": "IDECAM – WFS (Demo)",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "WFS",
      "qgis_type": "vector",
      "geometry": "Polygon",
      "wkbType": "MultiPolygon",
      "authid": "EPSG:4326",
      "srsname_from_uri": "EPSG:4326",
      "effective_srs": "EPSG:4326",
      "typename": "geonode:distritos_mendoza_epsg4326",
      "endpoint_url": "https://geonode-cam.marketsis.com.ar/geoserver/wfs",
      "version": "auto",
      "restrictToRequestBBOX": "1",
      "datasource_raw": " pagingEnabled='default' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' srsname='EPSG:4326' typename='geonode:distritos_mendoza_epsg4326' url='https://geonode-cam.marketsis.com.ar/geoserver/wfs' version='auto'",
      "fields": [
        "fid",
        "CODIGO_DEP",
        "DEPARTAMEN",
        "DISTRITO"
      ],
      "style": {
        "renderer": "singleSymbol",
        "symbol_type": "fill",
        "alpha": 1.0,
        "layers": [
          {
            "class": "SimpleLine",
            "enabled": "1",
            "options": {
              "line_color": "228,26,28,255,rgb:0.89411764705882357,0.10196078431372549,0.10980392156862745,1",
              "line_width": "0.36",
              "line_style": "solid",
              "name": "",
              "joinstyle": "bevel",
              "capstyle": "square",
              "offset": "0",
              "line_color_parsed": {
                "raw": "228,26,28,255,rgb:0.89411764705882357,0.10196078431372549,0.10980392156862745,1",
                "rgba": "rgba(228,26,28,1.000)",
                "hex": "#e41a1c",
                "opacity": 1.0
              }
            }
          }
        ]
      },
      "labeling": null,
      "layerOpacity": "1"
    },
    {
      "tree_order": 45,
      "draw_order_qgis_layerorder": 1,
      "id": "Google_Satellite_Hybrid_f9b3fd1e_4657_40b6_abd4_62532b57d47b",
      "name": "Google Satellite Hybrid",
      "group_path": "",
      "checked": "Qt::Checked",
      "visible_initial": true,
      "provider": "wms",
      "qgis_type": "raster",
      "geometry": null,
      "wkbType": null,
      "authid": "EPSG:3857",
      "srsname_from_uri": "EPSG:3857",
      "effective_srs": "EPSG:3857",
      "typename": null,
      "endpoint_url": "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      "version": null,
      "restrictToRequestBBOX": null,
      "datasource_raw": "crs=EPSG:3857&format&type=xyz&url=https://mt1.google.com/vt/lyrs%3Dy%26x%3D%7Bx%7D%26y%3D%7By%7D%26z%3D%7Bz%7D&zmax=19&zmin=0",
      "fields": [],
      "style": null,
      "labeling": null,
      "layerOpacity": null
    }
  ],
  "project_crs": {
    "authid": "EPSG:4326",
    "proj4": "+proj=longlat +datum=WGS84 +no_defs",
    "description": "WGS 84"
  },
  "initial_extent": {
    "xmin": "-68.7336986444611",
    "ymin": "-33.17171881346962437",
    "xmax": "-68.55063425246132169",
    "ymax": "-33.01616626946952238"
  },
  "plugin_spec": {
    "default_crs": "EPSG:22172",
    "tabs": [
      "Extraer de capa",
      "CSV / Transformar"
    ],
    "extract_layer_table_columns": [
      "N°",
      "FID",
      "Vértice",
      "Parte",
      "X",
      "Y",
      "Tipo geometría",
      "EPSG salida",
      "Etiqueta"
    ],
    "csv_table_columns": [
      "N°",
      "ID",
      "X original",
      "Y original",
      "X salida",
      "Y salida",
      "EPSG salida"
    ],
    "supported_geometries": [
      "PointGeometry",
      "LineGeometry",
      "PolygonGeometry"
    ],
    "feature_scope": [
      "todos los objetos",
      "solo objetos seleccionados si only_selected está activo; si no hay selección, advierte y no procesa toda la capa por accidente"
    ],
    "representative_point_logic": {
      "points": "primer punto si multipunto, o el punto simple",
      "polygons": "pointOnSurface si está seleccionado; si no, centroid",
      "lines": "si line_polygonize activo intenta QgsGeometry.polygonize([geom]) y usa centroid del polígono; si falla usa centroid de la línea"
    },
    "vertices_logic": {
      "points": "puntos simples o multipunto como PUNTO / VÉRTICE",
      "lines": "asMultiPolyline/asPolyline; recorre partes y vértices",
      "polygons": "asMultiPolygon/asPolygon; recorre polígonos y anillos; elimina el último punto si repite el primero para cerrar"
    },
    "numeric_format": "enteros por round si rb_integer; decimales con precisión 0 a 8, default 3",
    "temp_layer_from_layer_results": {
      "uri": "Point?crs={output_crs.authid()}",
      "name": "COORDENADAS_XY_LauGIS_v18",
      "fields": [
        "N",
        "FID_ORIG",
        "VERTICE",
        "PARTE",
        "X",
        "Y",
        "TIPO_GEOM",
        "EPSG",
        "ETIQUETA"
      ],
      "symbol": {
        "name": "circle",
        "size": "3.0",
        "color": "255,0,0,255",
        "outline_color": "255,255,255,255"
      },
      "labeling": {
        "fieldName": "ETIQUETA",
        "fontSize": 10,
        "color": "0,0,0"
      }
    },
    "csv_delimiter": "detecta ; si sample.count(;) >= sample.count(,), si no usa ,",
    "csv_field_autodetect": {
      "x": [
        "x",
        "este",
        "e",
        "easting",
        "coordx",
        "coord_x",
        "contiene este"
      ],
      "y": [
        "y",
        "norte",
        "n",
        "northing",
        "coordy",
        "coord_y",
        "contiene norte"
      ],
      "id": [
        "id",
        "fid",
        "punto",
        "nombre",
        "name"
      ]
    },
    "csv_temp_layer": {
      "uri": "Point?crs={csv_output_crs.authid()}",
      "name": "CSV_COORDENADAS_TRANSFORMADAS_LauGIS",
      "fields": [
        "N",
        "ID",
        "X",
        "Y",
        "EPSG",
        "ETIQUETA"
      ],
      "etiqueta": "P{n}",
      "same_symbol_and_labeling_as_layer_results": true
    },
    "xlsx": "escritura XLSX mínima con zip/xml, sin openpyxl"
  }
} as ExtractedIdecamData;

function toNumberOrNull(value: string | number | null): number | null {
  if (value === null) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export const SEED_DATA: SeedData = {
  author: 'laugis',
  projectCrs: IDECAM_EXTRACTED_DATA.project_crs,
  initialExtent: IDECAM_EXTRACTED_DATA.initial_extent,
  pluginSpec: IDECAM_EXTRACTED_DATA.plugin_spec,
  groups: IDECAM_EXTRACTED_DATA.groups.map((group, index) => ({
    id: `group_${group.path
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase() || 'root'}`,
    name: group.name,
    path: group.path,
    parentPath: group.parent,
    checked: group.checked,
    expanded: group.expanded === '1',
    depth: group.depth,
    treeOrder: index,
  })),
  layers: IDECAM_EXTRACTED_DATA.layers.map((layer): SeedLayer => ({
    id: layer.id,
    name: layer.name,
    groupPath: layer.group_path,
    checked: layer.checked,
    visibleInitial: layer.visible_initial,
    provider: layer.provider,
    qgisType: layer.qgis_type,
    geometry: layer.geometry,
    wkbType: layer.wkbType,
    authid: layer.authid,
    srsNameFromUri: layer.srsname_from_uri,
    effectiveSrs: layer.effective_srs,
    typename: layer.typename,
    endpointUrl: layer.endpoint_url,
    version: layer.version,
    restrictToRequestBBOX: layer.restrictToRequestBBOX,
    datasourceRaw: layer.datasource_raw,
    fields: [...layer.fields],
    style: layer.style,
    labeling: layer.labeling,
    layerOpacity: toNumberOrNull(layer.layerOpacity),
    treeOrder: layer.tree_order,
    drawOrder: layer.draw_order_qgis_layerorder,
  })),
};

export const IDECAM_LAYER_COUNT = SEED_DATA.layers.length;
export const IDECAM_GROUP_COUNT = SEED_DATA.groups.length;

if (IDECAM_LAYER_COUNT !== 46) {
  throw new Error(`Seed IDECAM inválido: se esperaban 46 capas y se encontraron ${IDECAM_LAYER_COUNT}.`);
}
