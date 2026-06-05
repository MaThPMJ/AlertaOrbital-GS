import type { Satelite } from '../types';
import { apiFetch } from '../api/client';
import type { SateliteDTO } from '../api/types';
import { mapSatelite } from '../api/mappers';

export async function listarSatelites(): Promise<Satelite[]> {
  const dtos = await apiFetch<SateliteDTO[]>('/satelites');
  return (dtos ?? []).map(mapSatelite);
}

export async function buscarSatelite(id: number): Promise<Satelite> {
  const dto = await apiFetch<SateliteDTO>(`/satelites/${id}`);
  return mapSatelite(dto);
}
