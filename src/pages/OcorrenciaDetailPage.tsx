import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useOcorrencia,
  useSatelitesDaOcorrencia,
  useAtualizarStatus,
  useVincularSatelite,
  useDesvincularSatelite,
} from '../hooks/useOcorrencias';
import { useAlertasDaOcorrencia, useCriarAlerta } from '../hooks/useAlertas';
import { useSatelites } from '../hooks/useSatelites';
import { useUsuarios } from '../hooks/useUsuarios';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeveridadeBadge } from '../components/ui/SeveridadeBadge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
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

  const { data: todosOsSatelites = [] } = useSatelites();
  const { data: usuarios = [] } = useUsuarios();
  const { mutate: criarAlerta, isPending: criandoAlerta, error: erroAlerta } = useCriarAlerta();
  const { mutate: vincularSatelite, isPending: vinculando } = useVincularSatelite();
  const { mutate: desvincularSatelite, isPending: desvinculando } = useDesvincularSatelite();

  const [showAlertaForm, setShowAlertaForm] = useState(false);
  const [alertaMensagem, setAlertaMensagem] = useState('');
  const [alertaUsuarioId, setAlertaUsuarioId] = useState<number>(0);
  const [alertaSeveridade, setAlertaSeveridade] = useState<'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO'>('ALTO');

  const [showVincularForm, setShowVincularForm] = useState(false);
  const [sateliteParaVincular, setSateliteParaVincular] = useState<number>(0);

  const [showDataFim, setShowDataFim] = useState(false);
  const [dataFimInput, setDataFimInput] = useState('');

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
    if (proximo === 'Resolvido' && !showDataFim) {
      setShowDataFim(true);
      return;
    }
    atualizarStatus(
      { id: ocorrencia!.id, status: proximo },
      { onSuccess: () => navigate(`/ocorrencias/${id}`) },
    );
  }

  function handleCriarAlerta(e: React.FormEvent) {
    e.preventDefault();
    if (!alertaMensagem.trim() || !alertaUsuarioId) return;
    criarAlerta(
      { mensagem: alertaMensagem.trim(), idOcorrencia: numId, idUsuario: alertaUsuarioId, severidade: alertaSeveridade },
      {
        onSuccess: () => {
          setAlertaMensagem('');
          setAlertaUsuarioId(0);
          setAlertaSeveridade('ALTO');
          setShowAlertaForm(false);
        },
      },
    );
  }

  function handleVincularSatelite(e: React.FormEvent) {
    e.preventDefault();
    if (!sateliteParaVincular) return;
    vincularSatelite(
      { ocorrenciaId: numId, sateliteId: sateliteParaVincular },
      {
        onSuccess: () => {
          setSateliteParaVincular(0);
          setShowVincularForm(false);
        },
      },
    );
  }

  const linkedIds = new Set(satelites.map((s) => s.satelite.id));
  const satelitesDisponiveis = todosOsSatelites.filter((s) => !linkedIds.has(s.id));

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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/ocorrencias/${id}/editar`)}
            >
              Editar
            </Button>
            {proximo && !showDataFim && (
              <Button
                variant="primary"
                size="sm"
                loading={atualizando}
                onClick={handleTransicao}
              >
                Marcar como {proximo}
              </Button>
            )}
            {showDataFim && (
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Data de encerramento</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={dataFimInput}
                    onChange={(e) => setDataFimInput(e.target.value)}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={atualizando}
                  disabled={!dataFimInput}
                  onClick={() =>
                    atualizarStatus(
                      { id: ocorrencia!.id, status: 'Resolvido' },
                      { onSuccess: () => navigate(`/ocorrencias/${id}/editar`, { state: { dataFim: dataFimInput } }) },
                    )
                  }
                >
                  Confirmar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowDataFim(false)}>
                  Cancelar
                </Button>
              </div>
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
                <span className="text-sm text-slate-500">{ocorrencia.regiao.pais}</span>
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
              const isFuturo = arr.indexOf(s) > arr.indexOf(ocorrencia.status);
              return (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 transition ${
                      isAtual
                        ? `${cfg.bg} ${cfg.border}`
                        : isFuturo
                        ? 'border-slate-700 bg-slate-800/30 opacity-40'
                        : 'border-slate-700/40 bg-slate-800/40'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        isAtual ? cfg.text : isFuturo ? 'text-slate-600' : 'text-slate-500'
                      }`}
                    >
                      {s}
                    </span>
                    {isAtual && (
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden />
                    )}
                  </div>
                  {i < arr.length - 1 && <span className="text-slate-700">→</span>}
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
            <Row label="Região" value={`${ocorrencia.regiao.nome} (${ocorrencia.regiao.pais})`} />
            <Row label="Data de Início" value={formatarData(ocorrencia.dataInicio)} />
            {ocorrencia.dataFim && (
              <Row label="Data de Encerramento" value={formatarData(ocorrencia.dataFim)} />
            )}
            {ocorrencia.areaAfetadaKm2 && (
              <Row
                label="Área Afetada"
                value={`${formatarNumero(ocorrencia.areaAfetadaKm2)} km²`}
              />
            )}
            {ocorrencia.populacaoAfetada && (
              <Row
                label="Pop. Afetada (est.)"
                value={formatarNumero(ocorrencia.populacaoAfetada)}
              />
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Satélites Detectores
              <span className="ml-2 text-xs font-normal text-slate-500">({satelites.length})</span>
            </h3>
            {satelitesDisponiveis.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowVincularForm((v) => !v)}
              >
                {showVincularForm ? 'Cancelar' : '+ Vincular'}
              </Button>
            )}
          </div>
        </CardHeader>

        {showVincularForm && (
          <div className="border-b border-slate-700/60 bg-slate-800/40 px-5 py-4">
            <form onSubmit={handleVincularSatelite} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-48">
                <Select
                  label="Satélite disponível"
                  placeholder="Selecione…"
                  options={satelitesDisponiveis.map((s) => ({
                    value: s.id,
                    label: `${s.nome} (${s.agencia})`,
                  }))}
                  value={sateliteParaVincular || ''}
                  onChange={(e) => setSateliteParaVincular(Number(e.target.value))}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={vinculando}
                disabled={!sateliteParaVincular}
              >
                Vincular
              </Button>
            </form>
          </div>
        )}

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
                  className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl" aria-hidden>🛰️</span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200 truncate">{os.satelite.nome}</p>
                        <p className="text-xs text-slate-500">{os.satelite.agencia}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${os.satelite.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                        {os.satelite.ativo ? 'Operacional' : 'Inativo'}
                      </span>
                      <button
                        type="button"
                        onClick={() => desvincularSatelite({ ocorrenciaId: numId, sateliteId: os.satelite.id })}
                        disabled={desvinculando}
                        className="text-xs text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50"
                        aria-label={`Desvincular ${os.satelite.nome}`}
                      >
                        Desvincular
                      </button>
                    </div>
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Alertas Associados
              <span className="ml-2 text-xs font-normal text-slate-500">({alertas.length})</span>
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAlertaForm((v) => !v)}
            >
              {showAlertaForm ? 'Cancelar' : '+ Novo Alerta'}
            </Button>
          </div>
        </CardHeader>

        {showAlertaForm && (
          <div className="border-b border-slate-700/60 bg-slate-800/40 px-5 py-4">
            <form onSubmit={handleCriarAlerta} className="space-y-3">
              <Select
                label="Nível de severidade"
                options={[
                  { value: 'CRITICO', label: 'Crítico — risco imediato à vida' },
                  { value: 'ALTO', label: 'Alto — situação grave' },
                  { value: 'MEDIO', label: 'Médio — monitoramento necessário' },
                  { value: 'BAIXO', label: 'Baixo — informativo' },
                ]}
                value={alertaSeveridade}
                onChange={(e) => setAlertaSeveridade(e.target.value as typeof alertaSeveridade)}
              />
              <Textarea
                label="Mensagem do alerta"
                placeholder="Descreva a situação e as medidas recomendadas…"
                rows={3}
                required
                value={alertaMensagem}
                onChange={(e) => setAlertaMensagem(e.target.value)}
              />
              <Select
                label="Responsável pela emissão"
                required
                placeholder="Selecione o usuário…"
                options={usuarios.map((u) => ({ value: u.id, label: `${u.nome} — ${u.agencia}` }))}
                value={alertaUsuarioId || ''}
                onChange={(e) => setAlertaUsuarioId(Number(e.target.value))}
              />
              {erroAlerta && (
                <p className="text-xs text-red-400">{(erroAlerta as Error).message}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowAlertaForm(false);
                    setAlertaMensagem('');
                    setAlertaUsuarioId(0);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={criandoAlerta}
                  disabled={!alertaMensagem.trim() || !alertaUsuarioId}
                >
                  Emitir Alerta
                </Button>
              </div>
            </form>
          </div>
        )}

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
