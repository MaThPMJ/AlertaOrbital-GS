import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOcorrencias } from '../hooks/useOcorrencias';
import { useRegioes } from '../hooks/useRegioes';
import { useTiposDesastre } from '../hooks/useTiposDesastre';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { PageLoading } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { formatarData, formatarNumero, TIPO_ICONE } from '../lib/utils';
import type { OcorrenciaFiltros, OcorrenciaStatus } from '../types';

const STATUS_OPTIONS = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Controlado', label: 'Controlado' },
  { value: 'Resolvido', label: 'Resolvido' },
];

export function OcorrenciasPage() {
  const [filtros, setFiltros] = useState<OcorrenciaFiltros>({});
  const [buscaTemp, setBuscaTemp] = useState('');

  const { data: ocorrencias, isLoading, isError, refetch } = useOcorrencias(filtros);
  const { data: regioes = [] } = useRegioes();
  const { data: tipos = [] } = useTiposDesastre();

  function aplicarBusca() {
    setFiltros((f) => ({ ...f, busca: buscaTemp }));
  }

  function limparFiltros() {
    setFiltros({});
    setBuscaTemp('');
  }

  const temFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ocorrências"
        description="Gerencie e monitore todos os eventos de desastre registrados"
        action={
          <Link
            to="/ocorrencias/nova"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            + Nova Ocorrência
          </Link>
        }
      />

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <div className="xl:col-span-2 flex gap-2">
              <Input
                placeholder="Buscar por tipo, região, descrição…"
                value={buscaTemp}
                onChange={(e) => setBuscaTemp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && aplicarBusca()}
                aria-label="Busca livre"
                className="flex-1"
              />
              <Button variant="secondary" size="md" onClick={aplicarBusca} aria-label="Buscar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </Button>
            </div>

            <Select
              placeholder="Todos os status"
              options={STATUS_OPTIONS}
              value={filtros.status ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, status: (e.target.value as OcorrenciaStatus) || undefined }))
              }
              aria-label="Filtrar por status"
            />

            <Select
              placeholder="Todos os tipos"
              options={tipos.map((t) => ({ value: t.id, label: t.nome }))}
              value={filtros.tipoDesastreId ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  tipoDesastreId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              aria-label="Filtrar por tipo de desastre"
            />

            <Select
              placeholder="Todas as regiões"
              options={regioes.map((r) => ({ value: r.id, label: `${r.nome} (${r.pais})` }))}
              value={filtros.regiaoId ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  regiaoId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              aria-label="Filtrar por região"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <Input
              type="date"
              aria-label="Data de início — de"
              value={filtros.dataInicioDe ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataInicioDe: e.target.value || undefined }))
              }
              className="w-auto"
            />
            <Input
              type="date"
              aria-label="Data de início — até"
              value={filtros.dataInicioAte ?? ''}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataInicioAte: e.target.value || undefined }))
              }
              className="w-auto"
            />
            {temFiltros && (
              <Button variant="ghost" size="sm" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Resultados */}
      {isLoading ? (
        <PageLoading />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !ocorrencias?.length ? (
        <EmptyState
          icon="🔍"
          title="Nenhuma ocorrência encontrada"
          description={temFiltros ? 'Tente ajustar os filtros aplicados.' : 'Nenhuma ocorrência cadastrada ainda.'}
          action={
            !temFiltros && (
              <Link
                to="/ocorrencias/nova"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
              >
                Cadastrar primeira ocorrência
              </Link>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {ocorrencias.length} ocorrência{ocorrencias.length !== 1 ? 's' : ''} encontrada{ocorrencias.length !== 1 ? 's' : ''}
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-700/60">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Região</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Início</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 lg:table-cell">Pop. Afetada</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {ocorrencias.map((o) => (
                  <tr key={o.id} className="bg-slate-900/30 transition hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden>{TIPO_ICONE[o.tipoDesastre.icone] ?? '⚠️'}</span>
                        <span className="font-medium text-slate-200">{o.tipoDesastre.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200">{o.regiao.nome}</p>
                      <p className="text-xs text-slate-500">{o.regiao.pais}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {formatarData(o.dataInicio)}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                      {o.populacaoAfetada ? formatarNumero(o.populacaoAfetada) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/ocorrencias/${o.id}`}
                        className="text-xs font-medium text-blue-400 hover:text-blue-300"
                      >
                        Detalhes →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
