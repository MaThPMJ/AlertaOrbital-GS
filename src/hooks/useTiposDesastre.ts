import { useQuery } from '@tanstack/react-query';
import { listarTiposDesastre } from '../services/tipoDesastreService';

export function useTiposDesastre() {
  return useQuery({
    queryKey: ['tiposDesastre'],
    queryFn: listarTiposDesastre,
    staleTime: Infinity,
  });
}
