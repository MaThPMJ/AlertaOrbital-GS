import { useUsuarios } from '../hooks/useUsuarios';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { PageLoading } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';

const PAPEL_CONFIG: Record<string, { label: string; className: string }> = {
  Administrador: { label: 'Administrador', className: 'bg-purple-500/15 text-purple-400' },
  Analista: { label: 'Analista', className: 'bg-blue-500/15 text-blue-400' },
  Operador: { label: 'Operador', className: 'bg-slate-700 text-slate-400' },
};

export function UsuariosPage() {
  const { data: usuarios = [], isLoading, isError, refetch } = useUsuarios();

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description={`${usuarios.length} usuário${usuarios.length !== 1 ? 's' : ''} cadastrado${usuarios.length !== 1 ? 's' : ''} no sistema`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {usuarios.map((usuario) => {
          const cfg = PAPEL_CONFIG[usuario.papel] ?? PAPEL_CONFIG.Operador;
          return (
            <Card key={usuario.id}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-lg font-semibold text-slate-300">
                    {usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-slate-200">{usuario.nome}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{usuario.agencia}</p>
                    <p className="truncate text-xs text-slate-500">{usuario.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
