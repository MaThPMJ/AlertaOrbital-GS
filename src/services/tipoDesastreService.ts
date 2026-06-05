import type { TipoDesastre } from '../types';
import { apiFetch } from '../api/client';
import type { TipoDesastreDTO } from '../api/types';
import { mapTipoDesastre } from '../api/mappers';

export async function listarTiposDesastre(): Promise<TipoDesastre[]> {
  const dtos = await apiFetch<TipoDesastreDTO[]>('/tipos-desastre');
  return (dtos ?? []).map(mapTipoDesastre);
}
