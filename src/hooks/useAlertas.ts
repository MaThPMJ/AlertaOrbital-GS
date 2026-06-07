import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarAlertasDaOcorrencia, listarTodosAlertas, criarAlerta } from '../services/alertaService';
import type { CriarAlertaPayload } from '../api/types';

export function useAlertasDaOcorrencia(ocorrenciaId: number) {
  return useQuery({
    queryKey: ['alertas', ocorrenciaId],
    queryFn: () => listarAlertasDaOcorrencia(ocorrenciaId),
    enabled: ocorrenciaId > 0,
  });
}

export function useTodosAlertas() {
  return useQuery({
    queryKey: ['alertas'],
    queryFn: listarTodosAlertas,
  });
}

export function useCriarAlerta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarAlertaPayload) => criarAlerta(payload),
    onSuccess: (_alerta, payload) => {
      qc.invalidateQueries({ queryKey: ['alertas', payload.idOcorrencia] });
      qc.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}
