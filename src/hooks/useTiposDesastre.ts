import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarTiposDesastre, criarTipoDesastre } from '../services/tipoDesastreService';
import type { CriarTipoDesastrePayload } from '../api/types';
import type { TipoDesastre } from '../types';

export function useTiposDesastre() {
  return useQuery({
    queryKey: ['tiposDesastre'],
    queryFn: listarTiposDesastre,
  });
}

export function useCriarTipoDesastre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarTipoDesastrePayload) => criarTipoDesastre(payload),
    onSuccess: (novoTipo) => {
      // Insere diretamente na cache — não depende de refetch
      qc.setQueryData<TipoDesastre[]>(['tiposDesastre'], (old = []) =>
        [...old, novoTipo].sort((a, b) => a.nome.localeCompare(b.nome)),
      );
    },
  });
}
