const PROFILE_PATTERNS: Array<{ match: RegExp; fields: RegExp[] }> = [
  {
    match: /parcela|parcelario/i,
    fields: [
      /nomen/i,
      /padron.*ren|padron_r|padron$/i,
      /padron.*mun/i,
      /depart/i,
      /distrit/i,
      /calle/i,
      /puerta|numero/i,
      /superfic|sup_emp|sup.*tit|sup.*parc/i,
      /tipo_der|concesion|derecho/i,
      /cc_pp|cauce|^cc$|^pg$|^pp$/i,
      /uso_riego|riego/i,
    ],
  },
  {
    match: /distrito/i,
    fields: [/depart/i, /distrit/i, /codigo_dep|cod.*dep/i],
  },
  {
    match: /PH|VESEP|MENSURA|ACTUALIZ|UNIFIC|FRACCION|PME|LOTEO|SERVIDUMBRE|ELECTRODUCTO/i,
    fields: [/tipo|clase|tramite/i, /plano|exped|ident|numero|nro/i, /nomen/i, /depart/i, /distrit/i, /observ/i],
  },
];

function internalField(field: string): boolean {
  return /^(fid|fid_\d+|gid|id|objectid|ogc_fid)$/i.test(field) || /geometry/i.test(field);
}

export function recommendedReportFields(layerName: string, fields: string[]): string[] {
  const useful = fields.filter((field) => !internalField(field));
  const profile = PROFILE_PATTERNS.find((item) => item.match.test(layerName));
  if (!profile) return useful.slice(0, 8);

  const picked: string[] = [];
  for (const pattern of profile.fields) {
    for (const field of useful) {
      if (pattern.test(field) && !picked.includes(field)) picked.push(field);
    }
  }
  return (picked.length ? picked : useful).slice(0, 12);
}
