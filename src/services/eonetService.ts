export interface DeteccaoExterna {
  id: string;
  fonte: 'NASA-EONET' | 'USGS';
  titulo: string;
  tipoEvento: string;
  tipoIcone: string;
  latitude: number;
  longitude: number;
  dataDeteccao: string;
  magnitude?: number;
  link?: string;
  satelite: string;
  escopo: 'Brasil' | 'América do Sul' | 'Global';
}

// Categorias relevantes para desastres naturais
const CATEGORIAS = 'wildfires,floods,severeStorms,landslides,volcanoes,drought';

// Bounding boxes para busca em cascata
const BBOXES = [
  { bbox: '-74,-34,-28,5',    escopo: 'Brasil' as const },
  { bbox: '-82,-56,-30,15',   escopo: 'América do Sul' as const },
];

function mapCategoria(catId: string): string {
  const mapa: Record<string, string> = {
    wildfires: 'Incêndio',
    floods: 'Enchente',
    severeStorms: 'Tempestade Severa',
    landslides: 'Deslizamento',
    volcanoes: 'Vulcão',
    drought: 'Seca',
    earthquakes: 'Terremoto',
    seaLakeIce: 'Gelo Marinho',
  };
  return mapa[catId] ?? 'Evento Natural';
}

function mapIcone(catId: string): string {
  const mapa: Record<string, string> = {
    wildfires: 'fire',
    floods: 'flood',
    severeStorms: 'hurricane',
    landslides: 'landslide',
    volcanoes: 'warning',
    drought: 'drought',
    earthquakes: 'warning',
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
        satelite: 'MODIS / VIIRS (NASA Terra & Aqua)',
        escopo,
      };
    });
}

async function fetchEONET(
  bbox?: string,
  escopo: DeteccaoExterna['escopo'] = 'Global',
): Promise<DeteccaoExterna[]> {
  const params = new URLSearchParams({
    status: 'open',
    days: '60',
    categories: CATEGORIAS,
  });
  if (bbox) params.set('bbox', bbox);

  const url = `https://eonet.gsfc.nasa.gov/api/v3/events?${params.toString()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`EONET HTTP ${res.status}`);
  const data = await res.json();
  return parseEventos(data, escopo);
}

export async function buscarEventosEONET(): Promise<DeteccaoExterna[]> {
  // 1. Tenta com bbox do Brasil
  for (const { bbox, escopo } of BBOXES) {
    const eventos = await fetchEONET(bbox, escopo);
    if (eventos.length > 0) return eventos;
  }

  // 2. Fallback: eventos globais (limitado a 30 para não sobrecarregar)
  const globais = await fetchEONET(undefined, 'Global');
  return globais.slice(0, 30);
}
