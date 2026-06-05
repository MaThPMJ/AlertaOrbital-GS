import { useParams, useNavigate } from 'react-router-dom';
import {
  useOcorrencia,
  useSatelitesDaOcorrencia,
  useAtualizarStatus,
} from '../hooks/useOcorrencias';
import { useAlertasDaOcorrencia } from '../hooks/useAlertas';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeveridadeBadge } from '../components/ui/SeveridadeBadge';
import { Button } from '../components/ui/Button';
import { PageLoading } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import {
  formatarData,
  formatarDataHora,
  formatarNumero,
  TIPO_ICONE,
  STATUS_CONFIG,
  proximoStatus,
} from '../lib/utils';
import type { OcorrenciaStatus } from '../types';

export function OcorrenciaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();

  const { data: ocorrencia, isLoading, isError, refetch } = useOcorrencia(numId);
  const { data: satelites = [], isLoading: loadingSat } = useSatelitesDaOcorrencia(numId);
  const { data: alertas = [], isLoading: loadingAlertas } = useAlertasDaOcorrencia(numId);
  const { mutate: atualizarStatus, isPending: atualizando } = useAtualizarStatus();

  if (isLoading) return <PageLoading />;
  if (isError || !ocorrencia) {
    return (
      <ErrorState
        title="Ocorrência não encontrada"
        message="O evento solicitado não existe ou foi removido."
        onRetry={() => refetch()}
      />
    );
  }

  const proximo = proximoStatus(ocorrencia.status);

  function handleTransicao() {
    if (!proximo) return;
    atualizarStatus(
      { id: ocorrencia!.id, status: proximo },
      { onSuccess: () => navigate(`/ocorrencias/${id}`) },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ocorrência #${ocorrencia.id}`}
        description="Detalhes do evento, satélites detectores e alertas associados"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              ← Voltar
            </Button>
            {proximo && (
              <Button
                variant="primary"
                size="sm"
                loading={atualizando}
                onClick={handleTransicao}
                aria-label={`Transicionar status para ${proximo}`}
              >
                Marcar como {proximo}
              </Button>
            )}
          </div>
        }
      />

      {/* Cabeçalho do evento */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-3xl">
              {TIPO_ICONE[ocorrencia.tipoDesastre.icone] ?? '⚠️'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-100">
                  {ocorrencia.tipoDesastre.nome} — {ocorrencia.regiao.nome}
                </h2>
                <span className="text-sm text-slate-500">{ocorrencia.regiao.estado}</span>
                <StatusBadge status={ocorrencia.status} />
              </div>
              <p className="mt-2 text-sm text-slate-400">{ocorrencia.descricao}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ciclo de vida */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-200">Ciclo de Vida</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {(['Ativo', 'Controlado', 'Resolvido'] as OcorrenciaStatus[]).map((s, i, arr) => {
              const cfg = STATUS_CONFIG[s];
              const isAtual = ocorrencia.status === s;
              const isFuturo =
                arr.indexOf(s) >
                arr.indexOf(ocorrencia.status);
              return (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 transition ${
                    isAtual
                      ? `${cfg.bg} ${cfg.border}`
                      : isFuturo
                      ? 'border-slate-700 bg-slate-800/30 opacity-40'
                      : 'border-slate-700/40 bg-slate-800/40'
                  }`}>
                    <span className={`text-xs font-semibold ${isAtual ? cfg.text : isFuturo ? 'text-slate-600' : 'text-slate-500'}`}>
                      {s}
                    </span>
                    {isAtual && (
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden />
                    )}
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-slate-700">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metadados */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-200">Informações do Evento</h3>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Tipo de Desastre" value={ocorrencia.tipoDesastre.nome} />
            <Row label="Região" value={`${ocorrencia.regiao.nome} (${ocorrencia.regiao.estado})`} />
            <Row label="Data de Início" value={formatarData(ocorrencia.dataInicio)} />
            {ocorrencia.dataFim && <Row label="Data de Encerramento" value={formatarData(ocorrencia.dataFim)} />}
            {ocorrencia.areaAfetadaKm2 && (
              <Row label="Área Afetada" value={`${formatarNumero(ocorrencia.areaAfetadaKm2)} km²`} />
            )}
            {ocorrencia.populacaoAfetada && (
              <Row label="Pop. Afetada (est.)" value={formatarNumero(ocorrencia.populacaoAfetada)} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-200">Registro</h3>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Registrado por" value={ocorrencia.registradoPor.nome} />
            <Row label="Agência" value={ocorrencia.registradoPor.agencia} />
            <Row label="Papel" value={ocorrencia.registradoPor.papel} />
            <Row label="Criado em" value={formatarDataHora(ocorrencia.criadoEm)} />
            <Row label="Atualizado em" value={formatarDataHora(ocorrencia.atualizadoEm)} />
          </CardContent>
        </Card>
      </div>

      {/* Satélites detectores */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-200">
            Satélites Detectores
            <span className="ml-2 text-xs text-slate-500">({satelites.length})</span>
          </h3>
        </CardHeader>
        <CardContent>
          {loadingSat ? (
            <p className="text-sm text-slate-500">Carregando satélites…</p>
          ) : !satelites.length ? (
            <EmptyState
              icon="🛰️"
              title="Sem satélites vinculados"
              description="Nenhum satélite registrou detecção para esta ocorrência."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {satelites.map((os) => (
                <div
                  key={os.satelite.id}
                  className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden>🛰️</span>
                    <div>
                      <p className="font-medium text-slate-200">{os.satelite.nome}</p>
                      <p className="text-xs text-slate-500">{os.satelite.agencia} · {os.satelite.tipoOrbita}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>Res: {os.satelite.resolucaoMetros}m</span>
                    <span>Imagens: {os.quantidadeImagens}</span>
                    <span>Confiança: {os.confianca}%</span>
                    <span className="col-span-2">1ª detecção: {formatarDataHora(os.primeiraDeteccao)}</span>
                  </div>
                  <div className="overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${os.confianca}%` }}
                      aria-label={`Confiança: ${os.confianca}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-200">
            Alertas Associados
            <span className="ml-2 text-xs text-slate-500">({alertas.length})</span>
          </h3>
        </CardHeader>
        <CardContent>
          {loadingAlertas ? (
            <p className="text-sm text-slate-500">Carregando alertas…</p>
          ) : !alertas.length ? (
            <EmptyState
              icon="🔔"
              title="Sem alertas emitidos"
              description="Nenhum alerta foi registrado para esta ocorrência."
            />
          ) : (
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex gap-3 rounded-lg border border-slate-700/40 bg-slate-800/30 p-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-200">{alerta.titulo}</span>
                      <SeveridadeBadge severidade={alerta.severidade} />
                    </div>
                    <p className="text-sm text-slate-400">{alerta.mensagem}</p>
                    <p className="text-xs text-slate-600">
                      {alerta.emitidoPor} · {formatarDataHora(alerta.emitidoEm)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-200">{value}</span>
    </div>
  );
}
