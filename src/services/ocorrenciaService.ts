import type {
  Ocorrencia,
  OcorrenciaFormData,
  OcorrenciaFiltros,
  OcorrenciaStatus,
  OcorrenciaSatelite,
  DashboardStats,
} from '../types';
import { apiFetch } from '../api/client';
import type { OcorrenciaDTO, SateliteDTO, CriarOcorrenciaPayload } from '../api/types';
import { mapOcorrencia, mapOcorrenciaSatelite } from '../api/mappers';
import { buscarRegiao } from './regiaoService';
import { listarTiposDesastre } from './tipoDesastreService';
import { mockOcorrencias, mockOcorrenciaSatelites } from './mockData';
import { setApiStatus } from '../lib/apiStatus';

// ─── Filtros client-side compartilhados ──────────────────────────────────────
function aplicarFiltros(lista: Ocorrencia[], filtros?: OcorrenciaFiltros): Ocorrencia[] {
  let resultado = lista;
  if (filtros?.status) resultado = resultado.filter((o) => o.status === filtros.status);
  if (filtros?.regiaoId) resultado = resultado.filter((o) => o.regiao.id === Number(filtros.regiaoId));
  if (filtros?.tipoDesastreId) resultado = resultado.filter((o) => o.tipoDesastre.id === Number(filtros.tipoDesastreId));
  if (filtros?.dataInicioDe) resultado = resultado.filter((o) => o.dataInicio >= filtros.dataInicioDe!);
  if (filtros?.dataInicioAte) resultado = resultado.filter((o) => o.dataInicio <= filtros.dataInicioAte!);
  if (filtros?.busca) {
    const termo = filtros.busca.toLowerCase();
    resultado = resultado.filter(
      (o) =>
        o.descricao.toLowerCase().includes(termo) ||
        o.tipoDesastre.nome.toLowerCase().includes(termo) ||
        o.regiao.nome.toLowerCase().includes(termo) ||
        o.regiao.cidade.toLowerCase().includes(termo),
    );
  }
  return resultado.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
}

// ─── Listagem com filtros ─────────────────────────────────────────────────────
export async function listarOcorrencias(filtros?: OcorrenciaFiltros): Promise<Ocorrencia[]> {
  try {
    let dtos: OcorrenciaDTO[];
    if (filtros?.status) {
      dtos = await apiFetch<OcorrenciaDTO[]>(`/ocorrencias/status/${filtros.status}`);
    } else if (filtros?.regiaoId) {
      dtos = await apiFetch<OcorrenciaDTO[]>(`/ocorrencias/regiao/${filtros.regiaoId}`);
    } else {
      dtos = await apiFetch<OcorrenciaDTO[]>('/ocorrencias');
    }

    let resultado = (dtos ?? []).map(mapOcorrencia);
    if (filtros?.tipoDesastreId) resultado = resultado.filter((o) => o.tipoDesastre.id === Number(filtros.tipoDesastreId));
    if (filtros?.regiaoId && !filtros.status) resultado = resultado.filter((o) => o.regiao.id === Number(filtros.regiaoId));
    if (filtros?.dataInicioDe) resultado = resultado.filter((o) => o.dataInicio >= filtros.dataInicioDe!);
    if (filtros?.dataInicioAte) resultado = resultado.filter((o) => o.dataInicio <= filtros.dataInicioAte!);
    if (filtros?.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (o) =>
          o.descricao.toLowerCase().includes(termo) ||
          o.tipoDesastre.nome.toLowerCase().includes(termo) ||
          o.regiao.nome.toLowerCase().includes(termo) ||
          o.regiao.cidade.toLowerCase().includes(termo),
      );
    }
    return resultado.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
  } catch {
    setApiStatus('mock');
    return aplicarFiltros([...mockOcorrencias], filtros);
  }
}

// ─── Busca por ID ──────────────────────────────────────────────────────────────
export async function buscarOcorrencia(id: number): Promise<Ocorrencia> {
  try {
    const dto = await apiFetch<OcorrenciaDTO>(`/ocorrencias/${id}`);
    return mapOcorrencia(dto);
  } catch {
    setApiStatus('mock');
    const found = mockOcorrencias.find((o) => o.id === id);
    if (found) return found;
    throw new Error(`Ocorrência ${id} não encontrada`);
  }
}

// ─── Cadastro ──────────────────────────────────────────────────────────────────
export async function cadastrarOcorrencia(dados: OcorrenciaFormData): Promise<Ocorrencia> {
  const [regiao, tipos] = await Promise.all([buscarRegiao(dados.regiaoId), listarTiposDesastre()]);
  const tipo = tipos.find((t) => t.id === dados.tipoDesastreId);
  if (!tipo) throw new Error('Tipo de desastre inválido.');

  const payload: CriarOcorrenciaPayload = {
    dataInicio: dados.dataInicio,
    dataFim: null,
    descricao: dados.descricao,
    status: 'Ativo',
    idRegiao: dados.regiaoId,
    idTipo: dados.tipoDesastreId,
    cidadeRegiao: regiao.nome,
    nomeTipo: tipo.nome,
  };

  const dto = await apiFetch<OcorrenciaDTO>('/ocorrencias', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapOcorrencia(dto);
}

// ─── Atualização de status ────────────────────────────────────────────────────
export async function atualizarStatus(id: number, novoStatus: OcorrenciaStatus): Promise<Ocorrencia> {
  const dto = await apiFetch<OcorrenciaDTO>(`/ocorrencias/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: novoStatus }),
  });
  return mapOcorrencia(dto);
}

// ─── Edição completa de ocorrência ───────────────────────────────────────────
export async function editarOcorrencia(
  id: number,
  dados: OcorrenciaFormData,
  statusAtual: OcorrenciaStatus,
): Promise<Ocorrencia> {
  const [regiao, tipos] = await Promise.all([buscarRegiao(dados.regiaoId), listarTiposDesastre()]);
  const tipo = tipos.find((t) => t.id === dados.tipoDesastreId);
  if (!tipo) throw new Error('Tipo de desastre inválido.');

  const payload: CriarOcorrenciaPayload = {
    dataInicio: dados.dataInicio,
    dataFim: dados.dataFim ?? null,
    descricao: dados.descricao,
    status: statusAtual,
    idRegiao: dados.regiaoId,
    idTipo: dados.tipoDesastreId,
    cidadeRegiao: regiao.nome,
    nomeTipo: tipo.nome,
  };

  const dto = await apiFetch<OcorrenciaDTO>(`/ocorrencias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return mapOcorrencia(dto);
}

// ─── Satélites vinculados à ocorrência ────────────────────────────────────────
export async function listarSatelitesDaOcorrencia(id: number): Promise<OcorrenciaSatelite[]> {
  try {
    const dtos = await apiFetch<SateliteDTO[]>(`/ocorrencias/${id}/satelites`);
    return (dtos ?? []).map((s) => mapOcorrenciaSatelite(id, s));
  } catch {
    setApiStatus('mock');
    return mockOcorrenciaSatelites.filter((os) => os.ocorrenciaId === id);
  }
}

// ─── Vínculo ocorrência ↔ satélite ────────────────────────────────────────────
export async function vincularSatelite(ocorrenciaId: number, sateliteId: number): Promise<void> {
  await apiFetch<void>(`/ocorrencias/${ocorrenciaId}/satelites/${sateliteId}`, { method: 'POST' });
}

export async function desvincularSatelite(ocorrenciaId: number, sateliteId: number): Promise<void> {
  await apiFetch<void>(`/ocorrencias/${ocorrenciaId}/satelites/${sateliteId}`, { method: 'DELETE' });
}

// ─── Estatísticas para o Dashboard (computadas client-side) ──────────────────
export async function obterDashboardStats(): Promise<DashboardStats> {
  const ocorrencias = await listarOcorrencias();

  const tipoMap = new Map<string, number>();
  const regiaoMap = new Map<string, number>();

  ocorrencias.forEach((o) => {
    tipoMap.set(o.tipoDesastre.nome, (tipoMap.get(o.tipoDesastre.nome) ?? 0) + 1);
    regiaoMap.set(o.regiao.nome, (regiaoMap.get(o.regiao.nome) ?? 0) + 1);
  });

  const recentes = [...ocorrencias]
    .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
    .slice(0, 5);

  return {
    totalAtivos: ocorrencias.filter((o) => o.status === 'Ativo').length,
    totalControlados: ocorrencias.filter((o) => o.status === 'Controlado').length,
    totalResolvidos: ocorrencias.filter((o) => o.status === 'Resolvido').length,
    porTipo: Array.from(tipoMap.entries()).map(([tipoNome, quantidade]) => ({ tipoNome, quantidade })),
    porRegiao: Array.from(regiaoMap.entries()).map(([regiaoNome, quantidade]) => ({ regiaoNome, quantidade })),
    ocorrenciasRecentes: recentes,
  };
}
