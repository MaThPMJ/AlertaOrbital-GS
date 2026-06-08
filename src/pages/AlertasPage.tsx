import { Link } from 'react-router-dom';
import { useTodosAlertas } from '../hooks/useAlertas';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { SeveridadeBadge } from '../components/ui/SeveridadeBadge';
import { PageLoading } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { formatarDataHora } from '../lib/utils';

export function AlertasPage() {
  const { data: alertas = [], isLoading, isError, refetch } = useTodosAlertas();

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const criticos = alertas.filter((a) => a.severidade === 'Critico').length;
  const altos = alertas.filter((a) => a.severidade === 'Alto').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Alertas"
        description={`${alertas.length} alertas no sistema — ${criticos} críticos, ${altos} altos`}
      />

      {/* Sumário por severidade */}
      {alertas.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              { label: 'Crítico', key: 'Critico', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
              { label: 'Alto', key: 'Alto', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
              { label: 'Médio', key: 'Medio', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
              { label: 'Baixo', key: 'Baixo', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400' },
            ] as const
          ).map(({ label, key, bg, border, text }) => (
            <div key={key} className={`rounded-xl border ${border} ${bg} px-4 py-3 text-center`}>
              <p className={`text-2xl font-bold ${text}`}>
                {alertas.filter((a) => a.severidade === key).length}
              </p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lista */}
      {alertas.length === 0 ? (
        <EmptyState icon="🔔" title="Sem alertas" description="Nenhum alerta foi emitido ainda." />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-200">
              Todos os alertas — mais recentes primeiro
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-700/50" role="list">
              {alertas.map((alerta) => (
                <li key={alerta.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-base">
                    🔔
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-200 text-sm">{alerta.titulo}</span>
                      <SeveridadeBadge severidade={alerta.severidade} />
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{alerta.mensagem}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span>Emitido por: <span className="text-slate-500">{alerta.emitidoPor}</span></span>
                      <span>{formatarDataHora(alerta.emitidoEm)}</span>
                      {alerta.ocorrenciaId > 0 && (
                        <Link
                          to={`/ocorrencias/${alerta.ocorrenciaId}`}
                          className="text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          Ver ocorrência #{alerta.ocorrenciaId} →
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
