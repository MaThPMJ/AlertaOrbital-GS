import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarRegioes, criarRegiao } from '../services/regiaoService';
import type { CriarRegiaoPayload } from '../api/types';
import type { Regiao } from '../types';

export function useRegioes() {
  return useQuery({
    queryKey: ['regioes'],
    queryFn: listarRegioes,
  });
}

export function useCriarRegiao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarRegiaoPayload) => criarRegiao(payload),
    onSuccess: (novaRegiao) => {
      // Insere diretamente na cache — não depende de refetch
      qc.setQueryData<Regiao[]>(['regioes'], (old = []) =>
        [...old, novaRegiao].sort((a, b) => a.nome.localeCompare(b.nome)),
      );
    },
  });
}
