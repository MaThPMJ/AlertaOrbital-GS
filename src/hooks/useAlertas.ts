import { useQuery } from '@tanstack/react-query';
import { listarAlertasDaOcorrencia, listarTodosAlertas } from '../services/alertaService';

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
