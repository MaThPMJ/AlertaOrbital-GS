import type { Regiao } from '../types';
import { apiFetch } from '../api/client';
import type { RegiaoDTO } from '../api/types';
import { mapRegiao } from '../api/mappers';

export async function listarRegioes(): Promise<Regiao[]> {
  const dtos = await apiFetch<RegiaoDTO[]>('/regioes');
  return (dtos ?? []).map(mapRegiao);
}

export async function buscarRegiao(id: number): Promise<Regiao> {
  const dto = await apiFetch<RegiaoDTO>(`/regioes/${id}`);
  return mapRegiao(dto);
}
