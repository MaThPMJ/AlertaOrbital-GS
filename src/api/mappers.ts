import type {
  OcorrenciaDTO,
  RegiaoDTO,
  TipoDesastreDTO,
  SateliteDTO,
  AlertaDTO,
} from './types';
import type {
  Ocorrencia,
  OcorrenciaStatus,
  Regiao,
  TipoDesastre,
  Satelite,
  Alerta,
  AlertaSeveridade,
  OcorrenciaSatelite,
} from '../types';

// ─── Normalização de strings da API ──────────────────────────────────────────

export function parseStatus(raw: string): OcorrenciaStatus {
  const s = (raw ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (s.includes('ativo') || s.includes('active')) return 'Ativo';
  if (s.includes('controlado') || s.includes('control')) return 'Controlado';
  if (s.includes('resolvido') || s.includes('resolv')) return 'Resolvido';
  return 'Ativo';
}

function parseOperacional(raw: string): boolean {
  return ['true', 's', 'sim', '1', 'yes', 'ativo', 'operacional'].includes(
    (raw ?? '').toLowerCase().trim(),
  );
}

function iconeParaNome(nome: string): string {
  const n = (nome ?? '').toLowerCase();
  if (n.includes('enchente') || n.includes('inunda') || n.includes('cheias')) return 'flood';
  if (n.includes('queimada') || n.includes('incendio') || n.includes('incêndio') || n.includes('fogo')) return 'fire';
  if (n.includes('seca') || n.includes('estiagem') || n.includes('seco')) return 'drought';
  if (n.includes('deslizamento') || n.includes('desab') || n.includes('erosao')) return 'landslide';
  if (n.includes('furacao') || n.includes('furacão') || n.includes('ciclon')) return 'hurricane';
  if (n.includes('tornado')) return 'tornado';
  return 'warning';
}

function nivelRiscoParaSeveridade(nivel: string): AlertaSeveridade {
  const n = (nivel ?? '').toLowerCase();
  if (n.includes('critico') || n.includes('crítico') || n.includes('extremo')) return 'Critico';
  if (n.includes('alto') || n.includes('grave')) return 'Alto';
  if (n.includes('medio') || n.includes('médio') || n.includes('moderado')) return 'Medio';
  return 'Baixo';
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapRegiao(dto: RegiaoDTO): Regiao {
  return {
    id: dto.idRegiao,
    nome: dto.nome,
    estado: dto.estado,
    latitude: 0,
    longitude: 0,
  };
}

export function mapTipoDesastre(dto: TipoDesastreDTO): TipoDesastre {
  return {
    id: dto.idTipo,
    nome: dto.nome,
    descricao: dto.descricao ?? '',
    icone: iconeParaNome(dto.nome),
  };
}

export function mapSatelite(dto: SateliteDTO): Satelite {
  return {
    id: dto.idSatelite,
    nome: dto.nome,
    agencia: dto.agencia,
    tipoOrbita: 'LEO',
    resolucaoMetros: 0,
    ativo: parseOperacional(dto.operacional),
    lancamento: '',
  };
}

export function mapOcorrencia(dto: OcorrenciaDTO): Ocorrencia {
  const tipo: TipoDesastre = {
    id: dto.idTipo,
    nome: dto.nomeTipo,
    descricao: '',
    icone: iconeParaNome(dto.nomeTipo),
  };

  const regiao: Regiao = {
    id: dto.idRegiao,
    nome: dto.nomeRegiao,
    estado: dto.estadoRegiao,
    latitude: 0,
    longitude: 0,
  };

  const agora = new Date().toISOString();

  return {
    id: dto.idOcorrencia,
    tipoDesastre: tipo,
    regiao,
    dataInicio: dto.dataInicio ?? agora.split('T')[0],
    dataFim: dto.dataFim ?? undefined,
    descricao: dto.descricao ?? '',
    status: parseStatus(dto.status),
    areaAfetadaKm2: undefined,
    populacaoAfetada: undefined,
    registradoPor: {
      id: 0,
      nome: 'Sistema',
      email: '',
      papel: 'Operador',
      agencia: '',
    },
    criadoEm: dto.dataInicio ? `${dto.dataInicio}T00:00:00Z` : agora,
    atualizadoEm: agora,
  };
}

export function mapAlerta(dto: AlertaDTO): Alerta {
  return {
    id: dto.idAlerta,
    ocorrenciaId: dto.idOcorrencia,
    titulo: dto.mensagem.length > 60 ? dto.mensagem.substring(0, 57) + '…' : dto.mensagem,
    mensagem: dto.mensagem,
    severidade: nivelRiscoParaSeveridade(dto.statusOcorrencia),
    emitidoEm: dto.dataEmissao ?? new Date().toISOString(),
    emitidoPor: dto.nomeUsuario ?? 'Sistema',
  };
}

export function mapOcorrenciaSatelite(
  ocorrenciaId: number,
  dto: SateliteDTO,
): OcorrenciaSatelite {
  return {
    ocorrenciaId,
    satelite: mapSatelite(dto),
    primeiraDeteccao: '',
    ultimaDeteccao: '',
    quantidadeImagens: 0,
    confianca: 0,
  };
}
