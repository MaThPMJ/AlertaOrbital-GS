import type { Usuario } from '../types';
import { apiFetch } from '../api/client';
import type { UsuarioDTO } from '../api/types';
import { mapUsuario } from '../api/mappers';

export async function listarUsuarios(): Promise<Usuario[]> {
  const dtos = await apiFetch<UsuarioDTO[]>('/usuarios');
  return (dtos ?? []).map(mapUsuario);
}

export async function buscarUsuario(id: number): Promise<Usuario> {
  const dto = await apiFetch<UsuarioDTO>(`/usuarios/${id}`);
  return mapUsuario(dto);
}
