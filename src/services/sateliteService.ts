import type { Satelite } from '../types';
import { apiFetch } from '../api/client';
import type { SateliteDTO } from '../api/types';
import { mapSatelite } from '../api/mappers';
import { mockSatelites } from './mockData';
import { setApiStatus } from '../lib/apiStatus';

export async function listarSatelites(): Promise<Satelite[]> {
  try {
    const dtos = await apiFetch<SateliteDTO[]>('/satelites');
    return (dtos ?? []).map(mapSatelite);
  } catch {
    setApiStatus('mock');
    return mockSatelites;
  }
}

export async function buscarSatelite(id: number): Promise<Satelite> {
  try {
    const dto = await apiFetch<SateliteDTO>(`/satelites/${id}`);
    return mapSatelite(dto);
  } catch {
    setApiStatus('mock');
    const found = mockSatelites.find((s) => s.id === id);
    if (found) return found;
    throw new Error(`Satélite ${id} não encontrado`);
  }
}
