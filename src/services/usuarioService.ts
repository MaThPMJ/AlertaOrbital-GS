import type { Usuario } from '../types';
import { apiFetch } from '../api/client';
import type { UsuarioDTO } from '../api/types';
import { mapUsuario } from '../api/mappers';
import { mockUsuarios } from './mockData';
import { setApiStatus } from '../lib/apiStatus';

export async function listarUsuarios(): Promise<Usuario[]> {
  try {
    const dtos = await apiFetch<UsuarioDTO[]>('/usuarios');
    return (dtos ?? []).map(mapUsuario);
  } catch {
    setApiStatus('mock');
    return mockUsuarios;
  }
}

export async function buscarUsuario(id: number): Promise<Usuario> {
  try {
    const dto = await apiFetch<UsuarioDTO>(`/usuarios/${id}`);
    return mapUsuario(dto);
  } catch {
    setApiStatus('mock');
    const found = mockUsuarios.find((u) => u.id === id);
    if (found) return found;
    throw new Error(`Usuário ${id} não encontrado`);
  }
}
