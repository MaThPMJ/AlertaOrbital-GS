import type { OcorrenciaStatus, AlertaSeveridade } from '../types';

// ─── Formatação de datas ──────────────────────────────────────────────────────
export function formatarData(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatarDataHora(isoString: string): string {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatarNumero(n: number): string {
  return n.toLocaleString('pt-BR');
}

// ─── Cores por status ─────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<OcorrenciaStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  Ativo: {
    label: 'Ativo',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  Controlado: {
    label: 'Controlado',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  Resolvido: {
    label: 'Resolvido',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
};

export const SEVERIDADE_CONFIG: Record<AlertaSeveridade, { label: string; bg: string; text: string }> = {
  Critico: { label: 'Crítico', bg: 'bg-red-500/20', text: 'text-red-300' },
  Alto: { label: 'Alto', bg: 'bg-orange-500/20', text: 'text-orange-300' },
  Medio: { label: 'Médio', bg: 'bg-amber-500/20', text: 'text-amber-300' },
  Baixo: { label: 'Baixo', bg: 'bg-sky-500/20', text: 'text-sky-300' },
};

// ─── Ícones textuais para tipos de desastre ───────────────────────────────────
export const TIPO_ICONE: Record<string, string> = {
  flood: '🌊',
  fire: '🔥',
  drought: '☀️',
  landslide: '⛰️',
  hurricane: '🌀',
  tornado: '🌪️',
};

// ─── Próximo status possível no ciclo de vida ─────────────────────────────────
export function proximoStatus(atual: OcorrenciaStatus): OcorrenciaStatus | null {
  if (atual === 'Ativo') return 'Controlado';
  if (atual === 'Controlado') return 'Resolvido';
  return null;
}

// ─── Classe condicional (utilidade simples) ───────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
