import type { DeteccaoExterna } from './eonetService';

// USGS opera o Landsat-9 (parceria NASA/USGS), e Sentinel-2 é usado para avaliação de danos pós-sismo
const SATELITES_SISMO = { ids: [5, 3, 4], nome: 'Landsat-9 (NASA/USGS) / Sentinel-2' };

function escopoDoTitulo(title: string): DeteccaoExterna['escopo'] {
  const t = title.toLowerCase();
  if (t.includes('brazil') || t.includes('brasil')) return 'Brasil';
  return 'América do Sul';
}

export async function buscarTerremotos(): Promise<DeteccaoExterna[]> {
  const url =
    'https://earthquake.usgs.gov/fdsnws/event/1/query' +
    '?format=geojson&minmagnitude=3' +
    '&minlatitude=-56&maxlatitude=15' +
    '&minlongitude=-82&maxlongitude=-28' +
    '&orderby=time&limit=30';

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`USGS ${res.status}`);

  const data = (await res.json()) as {
    features: Array<{
      id: string;
      properties: { title: string; mag: number; time: number; url: string };
      geometry: { coordinates: [number, number, number] };
    }>;
  };

  return data.features.map((f) => ({
    id: f.id,
    fonte: 'USGS' as const,
    titulo: f.properties.title,
    tipoEvento: 'Terremoto',
    tipoIcone: 'warning',
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    dataDeteccao: new Date(f.properties.time).toISOString(),
    magnitude: f.properties.mag,
    link: f.properties.url,
    satelite: SATELITES_SISMO.nome,
    sateliteIds: SATELITES_SISMO.ids,
    escopo: escopoDoTitulo(f.properties.title),
  }));
}
