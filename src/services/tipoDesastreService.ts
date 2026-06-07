import type { TipoDesastre } from '../types';
import { apiFetch } from '../api/client';
import type { TipoDesastreDTO } from '../api/types';
import { mapTipoDesastre } from '../api/mappers';
import { mockTiposDesastre } from './mockData';
import { setApiStatus } from '../lib/apiStatus';

export async function listarTiposDesastre(): Promise<TipoDesastre[]> {
  try {
    const dtos = await apiFetch<TipoDesastreDTO[]>('/tipos-desastre');
    return (dtos ?? []).map(mapTipoDesastre);
  } catch {
    setApiStatus('mock');
    return mockTiposDesastre;
  }
}
