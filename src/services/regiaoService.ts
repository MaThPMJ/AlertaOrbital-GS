import type { Regiao } from '../types';
import { apiFetch } from '../api/client';
import type { RegiaoDTO } from '../api/types';
import { mapRegiao } from '../api/mappers';
import { mockRegioes } from './mockData';
import { setApiStatus } from '../lib/apiStatus';

export async function listarRegioes(): Promise<Regiao[]> {
  try {
    const dtos = await apiFetch<RegiaoDTO[]>('/regioes');
    return (dtos ?? []).map(mapRegiao);
  } catch {
    setApiStatus('mock');
    return mockRegioes;
  }
}

export async function buscarRegiao(id: number): Promise<Regiao> {
  try {
    const dto = await apiFetch<RegiaoDTO>(`/regioes/${id}`);
    return mapRegiao(dto);
  } catch {
    setApiStatus('mock');
    const found = mockRegioes.find((r) => r.id === id);
    if (found) return found;
    return mockRegioes[0];
  }
}
