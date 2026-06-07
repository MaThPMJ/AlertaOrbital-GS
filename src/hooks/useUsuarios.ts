import { useQuery } from '@tanstack/react-query';
import { listarUsuarios } from '../services/usuarioService';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
    staleTime: Infinity,
  });
}
