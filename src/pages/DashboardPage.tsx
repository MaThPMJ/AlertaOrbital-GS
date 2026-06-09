import { Link } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useOcorrencias';
import { useTodosAlertas } from '../hooks/useAlertas';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeveridadeBadge } from '../components/ui/SeveridadeBadge';
import { PageLoading } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHeader } from '../components/layout/PageHeader';
import { formatarData, formatarDataHora, TIPO_ICONE } from '../lib/utils';

export function DashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();
  const { data: alertas = [] } = useTodosAlertas();

  if (isLoading) return <PageLoading />;
  if (isError || !stats) return <ErrorState onRetry={() => refetch()} />;

  const total = stats.totalAtivos + stats.totalControlados + stats.totalResolvidos;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do monitoramento de desastres naturais"
        action={
          <Link
            to="/ocorrencias/nova"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            + Nova Ocorrência
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de Ocorrências"
          value={total}
          icon="🌍"
          colorClass="bg-slate-700 text-slate-300"
        />
        <StatCard
          label="Ativas"
          value={stats.totalAtivos}
          icon="🔴"
          colorClass="bg-red-500/15 text-red-400"
          trend="requerem atenção imediata"
        />
        <StatCard
          label="Controladas"
          value={stats.totalControlados}
          icon="🟡"
          colorClass="bg-amber-500/15 text-amber-400"
          trend="em monitoramento"
        />
        <StatCard
          label="Resolvidas"
          value={stats.totalResolvidos}
          icon="🟢"
          colorClass="bg-emerald-500/15 text-emerald-400"
          trend="encerradas com sucesso"
        />
      </div>

      {/* Banner de detecções ao vivo */}
      <Link
        to="/deteccoes"
        className="flex items-center gap-4 rounded-xl border border-blue-500/20 bg-blue-600/10 px-5 py-4 transition hover:border-blue-500/40 hover:bg-blue-600/15"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-xl animate-pulse">
          🛰️
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-300">Detecções via Satélite ao Vivo</p>
          <p className="text-xs text-slate-500">NASA EONET + USGS — eventos naturais detectados automaticamente no Brasil</p>
        </div>
        <span className="shrink-0 text-xs text-blue-400">Ver detecções →</span>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ocorrências recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Ocorrências Recentes</h2>
              <Link to="/ocorrencias" className="text-xs text-blue-400 hover:text-blue-300">
                Ver todas →
              </Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-700/60">
            {stats.ocorrenciasRecentes.map((o) => (
              <Link
                key={o.id}
                to={`/ocorrencias/${o.id}`}
                className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-slate-700/30"
              >
                <span className="mt-0.5 text-xl" aria-hidden>
                  {TIPO_ICONE[o.tipoDesastre.icone] ?? '⚠️'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-200">
                      {o.tipoDesastre.nome} — {o.regiao.nome}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">{o.regiao.pais}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{o.descricao}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <StatusBadge status={o.status} />
                  <span className="text-xs text-slate-600">{formatarData(o.dataInicio)}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Alertas recentes + Distribuições */}
        <div className="flex flex-col gap-4">
          {/* Alertas recentes */}
          {alertas.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-200">Alertas Recentes</h2>
                  <Link to="/alertas" className="text-xs text-blue-400 hover:text-blue-300">
                    Ver todos →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {alertas.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <SeveridadeBadge severidade={a.severidade} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-slate-300">{a.titulo}</p>
                      <p className="text-xs text-slate-600">{formatarDataHora(a.emitidoEm)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-200">Por Tipo de Desastre</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.porTipo.map(({ tipoNome, quantidade }) => (
                <div key={tipoNome} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{tipoNome}</span>
                  <span className="text-sm font-semibold text-slate-200">{quantidade}</span>
                  <div className="w-16 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${(quantidade / total) * 100}%` }}
                      aria-label={`${((quantidade / total) * 100).toFixed(0)}%`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-200">Por Região</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.porRegiao.map(({ regiaoNome, quantidade }) => (
                <div key={regiaoNome} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{regiaoNome}</span>
                  <span className="text-sm font-semibold text-slate-200">{quantidade}</span>
                  <div className="w-16 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500"
                      style={{ width: `${(quantidade / total) * 100}%` }}
                      aria-label={`${((quantidade / total) * 100).toFixed(0)}%`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

