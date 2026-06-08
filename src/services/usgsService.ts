import type { DeteccaoExterna } from './eonetService';

function escopoDoTitulo(title: string): DeteccaoExterna['escopo'] {
  const t = title.toLowerCase();
  if (t.includes('brazil') || t.includes('brasil')) return 'Brasil';
  return 'América do Sul';
}

export async function buscarTerremotos(): Promise<DeteccaoExterna[]> {
  const url =
    'https://earthquake.usgs.gov/fdsnws/event/1/query' +
    '?format=geojson&minmagnitude=3' +
    '&minlatitude=-34&maxlatitude=5' +
    '&minlongitude=-74&maxlongitude=-28' +
    '&orderby=time&limit=20';

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
    satelite: 'Rede Sismográfica Global (USGS)',
    escopo: escopoDoTitulo(f.properties.title),
  }));
}
