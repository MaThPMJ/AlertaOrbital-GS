// ─── Status do ciclo de vida de uma Ocorrência ───────────────────────────────
export type OcorrenciaStatus = 'Ativo' | 'Controlado' | 'Resolvido';

// ─── Nível de severidade de um Alerta ────────────────────────────────────────
export type AlertaSeveridade = 'Critico' | 'Alto' | 'Medio' | 'Baixo';

// ─── 1. Regiao ────────────────────────────────────────────────────────────────
export interface Regiao {
  id: number;
  nome: string;
  pais: string;
  latitude: number;
  longitude: number;
}

// ─── 2. TipoDesastre ─────────────────────────────────────────────────────────
export interface TipoDesastre {
  id: number;
  nome: string;
  descricao: string;
  icone: string; // nome do ícone (usado no mapeamento de UI)
}

// ─── 3. Satelite ─────────────────────────────────────────────────────────────
export interface Satelite {
  id: number;
  nome: string;
  agencia: string;       // NASA, ESA, INPE, etc.
  tipoOrbita: string;    // LEO, GEO, SSO…
  resolucaoMetros: number;
  ativo: boolean;
  lancamento: string;    // ISO-8601 date string
}

// ─── 4. Usuario ──────────────────────────────────────────────────────────────
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: 'Analista' | 'Operador' | 'Administrador';
  agencia: string;
}

// ─── 5. Ocorrencia ───────────────────────────────────────────────────────────
export interface Ocorrencia {
  id: number;
  tipoDesastre: TipoDesastre;
  regiao: Regiao;
  dataInicio: string;      // ISO-8601 date string
  dataFim?: string;        // preenchida ao resolver
  descricao: string;
  status: OcorrenciaStatus;
  areaAfetadaKm2?: number;
  populacaoAfetada?: number;
  registradoPor: Usuario;
  criadoEm: string;        // ISO-8601 datetime
  atualizadoEm: string;
}

// ─── 6. Alerta ───────────────────────────────────────────────────────────────
export interface Alerta {
  id: number;
  ocorrenciaId: number;
  titulo: string;
  mensagem: string;
  severidade: AlertaSeveridade;
  emitidoEm: string;       // ISO-8601 datetime
  expiracaoEm?: string;
  emitidoPor: string;      // nome da fonte (ex.: "CEMADEN", "INMET")
}

// ─── 7. OcorrenciaSatelite (relação N:N) ──────────────────────────────────────
export interface OcorrenciaSatelite {
  ocorrenciaId: number;
  satelite: Satelite;
  primeiraDeteccao: string;  // ISO-8601 datetime
  ultimaDeteccao: string;
  quantidadeImagens: number;
  confianca: number;         // 0–100 (%)
}

// ─── Tipos utilitários para formulários e filtros ────────────────────────────

export interface OcorrenciaFormData {
  tipoDesastreId: number;
  regiaoId: number;
  dataInicio: string;
  dataFim?: string;
  descricao: string;
  areaAfetadaKm2?: number;
  populacaoAfetada?: number;
}

export interface OcorrenciaFiltros {
  status?: OcorrenciaStatus | '';
  tipoDesastreId?: number | '';
  regiaoId?: number | '';
  dataInicioDe?: string;
  dataInicioAte?: string;
  busca?: string;
}

// ─── Dados agregados para o Dashboard ────────────────────────────────────────
export interface DashboardStats {
  totalAtivos: number;
  totalControlados: number;
  totalResolvidos: number;
  porTipo: Array<{ tipoNome: string; quantidade: number }>;
  porRegiao: Array<{ regiaoNome: string; quantidade: number }>;
  ocorrenciasRecentes: Ocorrencia[];
}
