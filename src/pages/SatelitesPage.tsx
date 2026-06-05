import { useSatelites } from '../hooks/useSatelites';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { PageLoading } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { formatarData } from '../lib/utils';

export function SatelitesPage() {
  const { data: satelites = [], isLoading, isError, refetch } = useSatelites();

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const ativos = satelites.filter((s) => s.ativo).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Satélites de Observação"
        description={`${ativos} de ${satelites.length} satélites ativos no sistema`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {satelites.map((sat) => (
          <Card key={sat.id}>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-2xl">
                  🛰️
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-200 truncate">{sat.nome}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        sat.ativo
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {sat.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{sat.agencia}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-xs text-slate-500">
                    <span>Órbita: <span className="text-slate-400">{sat.tipoOrbita}</span></span>
                    <span>Res.: <span className="text-slate-400">{sat.resolucaoMetros}m</span></span>
                    <span className="col-span-2">Lançamento: <span className="text-slate-400">{formatarData(sat.lancamento)}</span></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
