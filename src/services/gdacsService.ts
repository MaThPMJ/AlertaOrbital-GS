import type { DeteccaoExterna } from './eonetService';

// IDs: 1=CBERS-4A, 2=Amazonia-1, 3=Sentinel-2A, 4=Sentinel-2B, 5=Landsat-9, 6=GOES-16
const TIPO_MAP: Record<string, { tipo: string; icone: string; sateliteIds: number[]; satelite: string }> = {
  EQ: { tipo: 'Terremoto',       icone: 'warning',    sateliteIds: [5, 3, 4],       satelite: 'Landsat-9 / Sentinel-2' },
  FL: { tipo: 'Enchente',        icone: 'flood',      sateliteIds: [3, 4, 2, 1, 5], satelite: 'Sentinel-2 / Amazonia-1 / CBERS-4A / Landsat-9' },
  WF: { tipo: 'Incêndio',        icone: 'fire',       sateliteIds: [5, 6, 3, 4, 2], satelite: 'Landsat-9 / GOES-16 / Sentinel-2 / Amazonia-1' },
  TC: { tipo: 'Ciclone Tropical',icone: 'hurricane',  sateliteIds: [6],             satelite: 'GOES-16' },
  VO: { tipo: 'Vulcão',          icone: 'warning',    sateliteIds: [3, 5, 6],       satelite: 'Sentinel-2A / Landsat-9 / GOES-16' },
  DR: { tipo: 'Seca',            icone: 'drought',    sateliteIds: [2, 1, 5],       satelite: 'Amazonia-1 / CBERS-4A / Landsat-9' },
  TS: { tipo: 'Tsunami',         icone: 'warning',    sateliteIds: [6, 5],          satelite: 'GOES-16 / Landsat-9' },
};
const DEFAULT_TIPO = { tipo: 'Evento Natural', icone: 'warning', sateliteIds: [3, 5], satelite: 'Sentinel-2A / Landsat-9' };

// Países da América do Sul reconhecidos pelo GDACS
const PAISES_SA = new Set([
  'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Bolivia',
  'Ecuador', 'Paraguay', 'Uruguay', 'Venezuela', 'Suriname', 'Guyana',
  'French Guiana', 'Trinidad and Tobago',
]);

// Bbox da América do Sul para filtro por coordenadas (fallback)
const SA_LAT_MIN = -56, SA_LAT_MAX = 15;
const SA_LON_MIN = -82, SA_LON_MAX = -28;

interface GdacsFeature {
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    eventtype: string;
    eventid: number;
    episodeid: number;
    name: string;
    alertlevel: string;
    fromdate: string;
    country: string;
    iso3: string;
    severitydata: { severity: number; severitytext: string; severityunit: string };
  };
}

export async function buscarEventosGDACS(): Promise<DeteccaoExterna[]> {
  const hoje = new Date();
  const ha30dias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const url =
    `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH` +
    `?fromDate=${fmt(ha30dias)}&toDate=${fmt(hoje)}` +
    `&alertlevel=Green,Orange,Red` +
    `&pagesize=50`;

  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`GDACS HTTP ${res.status}`);

  const data = (await res.json()) as { features: GdacsFeature[] };
  if (!Array.isArray(data.features)) return [];

  return data.features
    .filter((f) => {
      if (f.geometry?.type !== 'Point') return false;
      const [lon, lat] = f.geometry.coordinates;
      const inBbox = lat >= SA_LAT_MIN && lat <= SA_LAT_MAX && lon >= SA_LON_MIN && lon <= SA_LON_MAX;
      const inCountry = PAISES_SA.has(f.properties.country);
      return inBbox || inCountry;
    })
    .map((f) => {
      const [lon, lat] = f.geometry.coordinates;
      const config = TIPO_MAP[f.properties.eventtype] ?? DEFAULT_TIPO;

      const dentroBrasil =
        f.properties.country === 'Brazil' ||
        (lat >= -34 && lat <= 5 && lon >= -74 && lon <= -28);
      const escopo: DeteccaoExterna['escopo'] = dentroBrasil ? 'Brasil' : 'América do Sul';

      const mag =
        f.properties.severitydata.severityunit === 'M'
          ? f.properties.severitydata.severity
          : undefined;

      return {
        id: `gdacs-${f.properties.eventtype}-${f.properties.eventid}-${f.properties.episodeid}`,
        fonte: 'GDACS' as const,
        titulo: f.properties.name,
        tipoEvento: config.tipo,
        tipoIcone: config.icone,
        latitude: lat,
        longitude: lon,
        dataDeteccao: f.properties.fromdate,
        magnitude: mag,
        link: `https://www.gdacs.org/report.aspx?eventid=${f.properties.eventid}&episodeid=${f.properties.episodeid}&eventtype=${f.properties.eventtype}`,
        satelite: config.satelite,
        sateliteIds: config.sateliteIds,
        escopo,
      };
    });
}
