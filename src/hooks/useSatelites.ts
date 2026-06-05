import { useQuery } from '@tanstack/react-query';
import { listarSatelites } from '../services/sateliteService';

export function useSatelites() {
  return useQuery({
    queryKey: ['satelites'],
    queryFn: listarSatelites,
    staleTime: Infinity,
  });
}
