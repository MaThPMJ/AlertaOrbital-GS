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

// ─── Listagem com filtros (filtros sem suporte nativo na API → client-side) ───
export async function listarOcorrencias(filtros?: OcorrenciaFiltros): Promise<Ocorrencia[]> {
  let dtos: OcorrenciaDTO[];

  // Aproveita rotas filtradas do backend quando possível
  if (filtros?.status) {
    dtos = await apiFetch<OcorrenciaDTO[]>(`/ocorrencias/status/${filtros.status}`);
  } else if (filtros?.regiaoId) {
    dtos = await apiFetch<OcorrenciaDTO[]>(`/ocorrencias/regiao/${filtros.regiaoId}`);
  } else {
    dtos = await apiFetch<OcorrenciaDTO[]>('/ocorrencias');
  }

  let resultado = (dtos ?? []).map(mapOcorrencia);

  // Filtros adicionais aplicados no cliente
  if (filtros?.tipoDesastreId) {
    resultado = resultado.filter((o) => o.tipoDesastre.id === Number(filtros.tipoDesastreId));
  }
  if (filtros?.regiaoId && !filtros.status) {
    resultado = resultado.filter((o) => o.regiao.id === Number(filtros.regiaoId));
  }
  if (filtros?.dataInicioDe) {
    resultado = resultado.filter((o) => o.dataInicio >= filtros.dataInicioDe!);
  }
  if (filtros?.dataInicioAte) {
    resultado = resultado.filter((o) => o.dataInicio <= filtros.dataInicioAte!);
  }
  if (filtros?.busca) {
    const termo = filtros.busca.toLowerCase();
    resultado = resultado.filter(
      (o) =>
        o.descricao.toLowerCase().includes(termo) ||
        o.tipoDesastre.nome.toLowerCase().includes(termo) ||
        o.regiao.nome.toLowerCase().includes(termo) ||
        o.regiao.estado.toLowerCase().includes(termo),
    );
  }

  return resultado.sort(
    (a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime(),
  );
}

// ─── Busca por ID ──────────────────────────────────────────────────────────────
export async function buscarOcorrencia(id: number): Promise<Ocorrencia> {
  const dto = await apiFetch<OcorrenciaDTO>(`/ocorrencias/${id}`);
  return mapOcorrencia(dto);
}

// ─── Cadastro ──────────────────────────────────────────────────────────────────
export async function cadastrarOcorrencia(dados: OcorrenciaFormData): Promise<Ocorrencia> {
  // Busca nomes para completar o payload exigido pela API
  const [regiao, tipos] = await Promise.all([
    buscarRegiao(dados.regiaoId),
    listarTiposDesastre(),
  ]);
  const tipo = tipos.find((t) => t.id === dados.tipoDesastreId);
  if (!tipo) throw new Error('Tipo de desastre inválido.');

  const payload: CriarOcorrenciaPayload = {
    dataInicio: dados.dataInicio,
    dataFim: null,
    descricao: dados.descricao,
    status: 'Ativo',
    idRegiao: dados.regiaoId,
    idTipo: dados.tipoDesastreId,
    nomeRegiao: regiao.nome,
    estadoRegiao: regiao.estado,
    nomeTipo: tipo.nome,
    nivelRisco: '',
  };

  const dto = await apiFetch<OcorrenciaDTO>('/ocorrencias', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapOcorrencia(dto);
}

// ─── Atualização de status ────────────────────────────────────────────────────
export async function atualizarStatus(
  id: number,
  novoStatus: OcorrenciaStatus,
): Promise<Ocorrencia> {
  const dto = await apiFetch<OcorrenciaDTO>(`/ocorrencias/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: novoStatus }),
  });
  return mapOcorrencia(dto);
}

// ─── Satélites vinculados à ocorrência ────────────────────────────────────────
export async function listarSatelitesDaOcorrencia(id: number): Promise<OcorrenciaSatelite[]> {
  const dtos = await apiFetch<SateliteDTO[]>(`/ocorrencias/${id}/satelites`);
  return (dtos ?? []).map((s) => mapOcorrenciaSatelite(id, s));
}

// ─── Estatísticas para o Dashboard (computadas client-side) ──────────────────
export async function obterDashboardStats(): Promise<DashboardStats> {
  const dtos = await apiFetch<OcorrenciaDTO[]>('/ocorrencias');
  const ocorrencias = (dtos ?? []).map(mapOcorrencia);

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

