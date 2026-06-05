import { useState } from 'react';
import { useOcorrencias } from '../hooks/useOcorrencias';
import { useRegioes } from '../hooks/useRegioes';
import { useTiposDesastre } from '../hooks/useTiposDesastre';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageLoading } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import {
  formatarData,
  formatarDataHora,
  formatarNumero,
  TIPO_ICONE,
} from '../lib/utils';
import type { OcorrenciaFiltros, OcorrenciaStatus } from '../types';

const STATUS_OPTIONS = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Controlado', label: 'Controlado' },
  { value: 'Resolvido', label: 'Resolvido' },
];

export function RelatoriosPage() {
  const [filtros, setFiltros] = useState<OcorrenciaFiltros>({});

  const { data: ocorrencias = [], isLoading } = useOcorrencias(filtros);
  const { data: regioes = [] } = useRegioes();
  const { data: tipos = [] } = useTiposDesastre();

  function exportarJSON() {
    const payload = {
      geradoEm: new Date().toISOString(),
      filtrosAplicados: filtros,
      totalRegistros: ocorrencias.length,
      ocorrencias: ocorrencias.map((o) => ({
        id: o.id,
        tipoDesastre: o.tipoDesastre.nome,
        regiao: `${o.regiao.nome} (${o.regiao.estado})`,
        dataInicio: o.dataInicio,
        dataFim: o.dataFim ?? null,
        descricao: o.descricao,
        status: o.status,
        areaAfetadaKm2: o.areaAfetadaKm2 ?? null,
        populacaoAfetada: o.populacaoAfetada ?? null,
        registradoPor: o.registradoPor.nome,
        agencia: o.registradoPor.agencia,
        criadoEm: o.criadoEm,
        atualizadoEm: o.atualizadoEm,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alertaorbital-relatorio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalAfetados = ocorrencias.reduce((acc, o) => acc + (o.populacaoAfetada ?? 0), 0);
  const totalArea = ocorrencias.reduce((acc, o) => acc + (o.areaAfetadaKm2 ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Filtre os dados e exporte o relatório em JSON"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={exportarJSON}
            disabled={!ocorrencias.length}
            aria-label="Exportar relatório em formato JSON"
          >
            ↓ Exportar JSON ({ocorrencias.length})
          </Button>
        }
      />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">Filtros do Relatório</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Status"
              placeholder="Todos"
              options={STATUS_OPTIONS}
              value={filtros.status ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, status: (e.target.value as OcorrenciaStatus) || undefined }))
              }
            />
            <Select
              label="Tipo de Desastre"
              placeholder="Todos"
              options={tipos.map((t) => ({ value: t.id, label: t.nome }))}
              value={filtros.tipoDesastreId ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  tipoDesastreId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
            <Select
              label="Região"
              placeholder="Todas"
              options={regioes.map((r) => ({ value: r.id, label: `${r.nome} (${r.estado})` }))}
              value={filtros.regiaoId ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  regiaoId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setFiltros({})}
                className="w-full justify-center"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Data de início — de"
              type="date"
              value={filtros.dataInicioDe ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataInicioDe: e.target.value || undefined }))
              }
            />
            <Input
              label="Data de início — até"
              type="date"
              value={filtros.dataInicioAte ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataInicioAte: e.target.value || undefined }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Totalizadores */}
      {!isLoading && ocorrencias.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-slate-100">{ocorrencias.length}</p>
              <p className="text-xs text-slate-500">Ocorrências</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-slate-100">
                {formatarNumero(Math.round(totalAfetados))}
              </p>
              <p className="text-xs text-slate-500">Pessoas afetadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-slate-100">
                {formatarNumero(Math.round(totalArea))} km²
              </p>
              <p className="text-xs text-slate-500">Área total afetada</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de resultados */}
      {isLoading ? (
        <PageLoading />
      ) : !ocorrencias.length ? (
        <EmptyState icon="📊" title="Sem dados para o período" description="Ajuste os filtros para visualizar ocorrências." />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-200">
              Resultados — {ocorrencias.length} registros
            </h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Região</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Início</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Pop. Afetada</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Área (km²)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Atualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {ocorrencias.map((o) => (
                  <tr key={o.id} className="bg-slate-900/30 text-slate-300 transition hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-600">#{o.id}</td>
                    <td className="px-4 py-3">
                      <span className="mr-1.5">{TIPO_ICONE[o.tipoDesastre.icone] ?? '⚠️'}</span>
                      {o.tipoDesastre.nome}
                    </td>
                    <td className="px-4 py-3">{o.regiao.nome} <span className="text-slate-500">({o.regiao.estado})</span></td>
                    <td className="px-4 py-3 tabular-nums">{formatarData(o.dataInicio)}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {o.populacaoAfetada ? formatarNumero(o.populacaoAfetada) : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {o.areaAfetadaKm2 ? formatarNumero(o.areaAfetadaKm2) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                      {formatarDataHora(o.atualizadoEm)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
