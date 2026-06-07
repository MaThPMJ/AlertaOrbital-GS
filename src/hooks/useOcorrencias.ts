import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { OcorrenciaFiltros, OcorrenciaFormData, OcorrenciaStatus } from '../types';
import {
  listarOcorrencias,
  buscarOcorrencia,
  cadastrarOcorrencia,
  editarOcorrencia,
  atualizarStatus,
  listarSatelitesDaOcorrencia,
  vincularSatelite,
  desvincularSatelite,
  obterDashboardStats,
} from '../services/ocorrenciaService';

export const QUERY_KEYS = {
  ocorrencias: (filtros?: OcorrenciaFiltros) => ['ocorrencias', filtros] as const,
  ocorrencia: (id: number) => ['ocorrencias', id] as const,
  satelites: (id: number) => ['ocorrencias', id, 'satelites'] as const,
  dashboard: () => ['dashboard'] as const,
};

export function useOcorrencias(filtros?: OcorrenciaFiltros) {
  return useQuery({
    queryKey: QUERY_KEYS.ocorrencias(filtros),
    queryFn: () => listarOcorrencias(filtros),
  });
}

export function useOcorrencia(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.ocorrencia(id),
    queryFn: () => buscarOcorrencia(id),
    enabled: id > 0,
  });
}

export function useSatelitesDaOcorrencia(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.satelites(id),
    queryFn: () => listarSatelitesDaOcorrencia(id),
    enabled: id > 0,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(),
    queryFn: obterDashboardStats,
  });
}

export function useCadastrarOcorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: OcorrenciaFormData) => cadastrarOcorrencia(dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ocorrencias'] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard() });
    },
  });
}

export function useEditarOcorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dados,
      statusAtual,
    }: {
      id: number;
      dados: OcorrenciaFormData;
      statusAtual: OcorrenciaStatus;
    }) => editarOcorrencia(id, dados, statusAtual),
    onSuccess: (atualizada) => {
      qc.invalidateQueries({ queryKey: ['ocorrencias'] });
      qc.setQueryData(QUERY_KEYS.ocorrencia(atualizada.id), atualizada);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard() });
    },
  });
}

export function useVincularSatelite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ocorrenciaId, sateliteId }: { ocorrenciaId: number; sateliteId: number }) =>
      vincularSatelite(ocorrenciaId, sateliteId),
    onSuccess: (_, { ocorrenciaId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.satelites(ocorrenciaId) });
    },
  });
}

export function useDesvincularSatelite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ocorrenciaId, sateliteId }: { ocorrenciaId: number; sateliteId: number }) =>
      desvincularSatelite(ocorrenciaId, sateliteId),
    onSuccess: (_, { ocorrenciaId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.satelites(ocorrenciaId) });
    },
  });
}

export function useAtualizarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OcorrenciaStatus }) =>
      atualizarStatus(id, status),
    onSuccess: (atualizada) => {
      qc.invalidateQueries({ queryKey: ['ocorrencias'] });
      qc.setQueryData(QUERY_KEYS.ocorrencia(atualizada.id), atualizada);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard() });
    },
  });
}
