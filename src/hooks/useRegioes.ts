import { useQuery } from '@tanstack/react-query';
import { listarRegioes } from '../services/regiaoService';

export function useRegioes() {
  return useQuery({
    queryKey: ['regioes'],
    queryFn: listarRegioes,
    staleTime: Infinity,
  });
}
