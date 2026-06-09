export interface DeteccaoExterna {
  id: string;
  fonte: 'NASA-EONET' | 'USGS' | 'GDACS';
  titulo: string;
  tipoEvento: string;
  tipoIcone: string;
  latitude: number;
  longitude: number;
  dataDeteccao: string;
  magnitude?: number;
  link?: string;
  satelite: string;
  sateliteIds: number[];
  escopo: 'Brasil' | 'América do Sul';
}

// Mapeamento categoria → satélites reais do banco de dados
// IDs: 1=CBERS-4A, 2=Amazonia-1, 3=Sentinel-2A, 4=Sentinel-2B, 5=Landsat-9, 6=GOES-16
const SATELITES_POR_CATEGORIA: Record<string, { ids: number[]; nome: string }> = {
  wildfires:     { ids: [5, 6, 3, 4, 2, 1], nome: 'Landsat-9 / GOES-16 / Sentinel-2 / Amazonia-1' },
  severeStorms:  { ids: [6],               nome: 'GOES-16' },
  floods:        { ids: [3, 4, 2, 1, 5],   nome: 'Sentinel-2 / Amazonia-1 / CBERS-4A / Landsat-9' },
  landslides:    { ids: [3, 4, 5, 2],      nome: 'Sentinel-2 / Landsat-9 / Amazonia-1' },
  volcanoes:     { ids: [3, 5, 6],         nome: 'Sentinel-2A / Landsat-9 / GOES-16' },
  drought:       { ids: [2, 1, 5],         nome: 'Amazonia-1 / CBERS-4A / Landsat-9' },
  earthquakes:   { ids: [5, 3, 4],         nome: 'Landsat-9 / Sentinel-2' },
  seaLakeIce:    { ids: [5, 3],            nome: 'Landsat-9 / Sentinel-2A' },
  tempExtremes:  { ids: [6, 5],            nome: 'GOES-16 / Landsat-9' },
};

const DEFAULT_SATELITES = { ids: [3, 5], nome: 'Sentinel-2A / Landsat-9' };

const CATEGORIAS = 'wildfires,floods,severeStorms,landslides,volcanoes,drought,earthquakes,seaLakeIce,tempExtremes';

const BBOX_SA = '-82,-56,-30,15';

function mapCategoria(catId: string): string {
  const mapa: Record<string, string> = {
    wildfires:    'Incêndio',
    floods:       'Enchente',
    severeStorms: 'Tempestade Severa',
    landslides:   'Deslizamento',
    volcanoes:    'Vulcão',
    drought:      'Seca',
    earthquakes:  'Terremoto',
    seaLakeIce:   'Gelo Marinho',
    tempExtremes: 'Extremo Térmico',
  };
  return mapa[catId] ?? 'Evento Natural';
}

function mapIcone(catId: string): string {
  const mapa: Record<string, string> = {
    wildfires:    'fire',
    floods:       'flood',
    severeStorms: 'hurricane',
    landslides:   'landslide',
    volcanoes:    'warning',
    drought:      'drought',
    earthquakes:  'warning',
  };
  return mapa[catId] ?? 'warning';
}

function parseEventos(
  data: {
    events: Array<{
      id: string;
      title: string;
      link: string;
      categories: Array<{ id: string }>;
      geometry: Array<{ date: string; coordinates: [number, number] | [number, number, number] }>;
    }>;
  },
  escopo: DeteccaoExterna['escopo'],
): DeteccaoExterna[] {
  return data.events
    .filter((ev) => ev.geometry.length > 0)
    .map((ev) => {
      const geo = ev.geometry[ev.geometry.length - 1];
      const catId = ev.categories[0]?.id ?? '';
      const coords = geo.coordinates;
      const sat = SATELITES_POR_CATEGORIA[catId] ?? DEFAULT_SATELITES;
      return {
        id: ev.id,
        fonte: 'NASA-EONET' as const,
        titulo: ev.title,
        tipoEvento: mapCategoria(catId),
        tipoIcone: mapIcone(catId),
        latitude: coords[1],
        longitude: coords[0],
        dataDeteccao: geo.date,
        link: ev.link,
        satelite: sat.nome,
        sateliteIds: sat.ids,
        escopo,
      };
    });
}

export async function buscarEventosEONET(): Promise<DeteccaoExterna[]> {
  const params = new URLSearchParams({
    days: '365',
    categories: CATEGORIAS,
    limit: '50',
    bbox: BBOX_SA,
  });

  const url = `https://eonet.gsfc.nasa.gov/api/v3/events?${params.toString()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`EONET HTTP ${res.status}`);
  const data = await res.json();

  const eventos = parseEventos(data, 'América do Sul');

  return eventos.map((e) => {
    const dentroBrasil =
      e.longitude >= -74 && e.longitude <= -28 &&
      e.latitude  >= -34 && e.latitude  <=  5;
    return dentroBrasil ? { ...e, escopo: 'Brasil' as const } : e;
  });
}
