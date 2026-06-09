// ─── DTOs que espelham exatamente o contrato da API ──────────────────────────

export interface OcorrenciaDTO {
  idOcorrencia: number;
  dataInicio: string;
  dataFim: string | null;
  descricao: string;
  status: string;
  idRegiao: number;
  idTipo: number;
  cidadeRegiao: string;
  nomeTipo: string;
}

export interface RegiaoDTO {
  idRegiao: number;
  cidade: string;
  pais: string;
}

export interface TipoDesastreDTO {
  idTipo: number;
  nome: string;
  descricao: string;
  nivelRisco: string;
}

export interface SateliteDTO {
  idSatelite: number;
  nome: string;
  agencia: string;
  operacional: string; // "S"/"N", "true"/"false", "Sim"/"Não", etc.
}

export interface UsuarioDTO {
  idUsuario: number;
  nome: string;
  cargo: string;
  email: string;
}

export interface AlertaDTO {
  idAlerta: number;
  mensagem: string;
  dataEmissao: string;
  idOcorrencia: number;
  idUsuario: number;
  nomeUsuario: string;
  descricaoOcorrencia: string;
  statusOcorrencia: string;
}

// ─── Payloads de escrita ──────────────────────────────────────────────────────

export interface CriarOcorrenciaPayload {
  dataInicio: string;
  dataFim: string | null;
  descricao: string;
  status: string;
  idRegiao: number;
  idTipo: number;
  cidadeRegiao: string;
  nomeTipo: string;
}

export interface AtualizarStatusPayload {
  status: string;
}

export interface CriarAlertaPayload {
  mensagem: string;
  idOcorrencia: number;
  idUsuario: number;
  severidade: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
}

export interface CriarTipoDesastrePayload {
  nome: string;
  descricao: string;
  nivelRisco: string;
}

export interface CriarRegiaoPayload {
  cidade: string;
  pais: string;
}
