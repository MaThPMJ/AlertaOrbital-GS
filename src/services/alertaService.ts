import type { Alerta } from '../types';
import { apiFetch } from '../api/client';
import type { AlertaDTO, CriarAlertaPayload } from '../api/types';
import { mapAlerta } from '../api/mappers';
import { mockAlertas } from './mockData';
import { setApiStatus } from '../lib/apiStatus';

export async function listarAlertasDaOcorrencia(ocorrenciaId: number): Promise<Alerta[]> {
  try {
    const dtos = await apiFetch<AlertaDTO[]>(`/alertas/ocorrencia/${ocorrenciaId}`);
    return (dtos ?? []).map(mapAlerta);
  } catch {
    setApiStatus('mock');
    return mockAlertas.filter((a) => a.ocorrenciaId === ocorrenciaId);
  }
}

export async function listarTodosAlertas(): Promise<Alerta[]> {
  try {
    const dtos = await apiFetch<AlertaDTO[]>('/alertas');
    return (dtos ?? [])
      .map(mapAlerta)
      .sort((a, b) => new Date(b.emitidoEm).getTime() - new Date(a.emitidoEm).getTime());
  } catch {
    setApiStatus('mock');
    return [...mockAlertas].sort(
      (a, b) => new Date(b.emitidoEm).getTime() - new Date(a.emitidoEm).getTime(),
    );
  }
}

const TAGS: Record<CriarAlertaPayload['severidade'], string> = {
  CRITICO: '[CRÍTICO]',
  ALTO: '[ALTO]',
  MEDIO: '[MÉDIO]',
  BAIXO: '[BAIXO]',
};

export async function criarAlerta(payload: CriarAlertaPayload): Promise<Alerta> {
  const tag = TAGS[payload.severidade];
  const dto = await apiFetch<AlertaDTO>('/alertas', {
    method: 'POST',
    body: JSON.stringify({
      mensagem: `${tag} ${payload.mensagem}`,
      idOcorrencia: payload.idOcorrencia,
      idUsuario: payload.idUsuario,
    }),
  });
  return mapAlerta(dto);
}
