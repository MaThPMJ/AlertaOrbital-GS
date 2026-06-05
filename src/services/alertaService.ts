import type { Alerta } from '../types';
import { apiFetch } from '../api/client';
import type { AlertaDTO } from '../api/types';
import { mapAlerta } from '../api/mappers';

export async function listarAlertasDaOcorrencia(ocorrenciaId: number): Promise<Alerta[]> {
  const dtos = await apiFetch<AlertaDTO[]>(`/alertas/ocorrencia/${ocorrenciaId}`);
  return (dtos ?? []).map(mapAlerta);
}

export async function listarTodosAlertas(): Promise<Alerta[]> {
  const dtos = await apiFetch<AlertaDTO[]>('/alertas');
  return (dtos ?? [])
    .map(mapAlerta)
    .sort((a, b) => new Date(b.emitidoEm).getTime() - new Date(a.emitidoEm).getTime());
}
