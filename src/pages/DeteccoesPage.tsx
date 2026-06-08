import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarEventosEONET, type DeteccaoExterna } from '../services/eonetService';
import { buscarTerremotos } from '../services/usgsService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatarDataHora, TIPO_ICONE } from '../lib/utils';

const FONTE_CONFIG = {
  'NASA-EONET': { label: 'NASA EONET', cor: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  USGS: { label: 'USGS Sismos', cor: 'bg-violet-500/10 border-violet-500/30 text-violet-400' },
} as const;

const ESCOPO_CONFIG = {
  Brasil: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  'América do Sul': 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  Global: 'bg-slate-600/40 border-slate-600/60 text-slate-400',
} as const;

function DeteccaoCard({
  deteccao,
  onCriarOcorrencia,
}: {
  deteccao: DeteccaoExterna;
  onCriarOcorrencia: (d: DeteccaoExterna) => void;
}) {
  const icone = TIPO_ICONE[deteccao.tipoIcone] ?? '⚠️';
  const fonte = FONTE_CONFIG[deteccao.fonte];
  const escopoCor = deteccao.escopo ? ESCOPO_CONFIG[deteccao.escopo] : ESCOPO_CONFIG['Global'];

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 space-y-4 hover:border-slate-600/60 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-xl">
          {icone}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-200 text-sm leading-snug">{deteccao.titulo}</p>
          <p className="text-xs text-slate-500 mt-0.5">{deteccao.tipoEvento}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">🛰️</span>
          <span>{deteccao.satelite}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">📍</span>
          <span className="font-mono">
            {deteccao.latitude.toFixed(4)}, {deteccao.longitude.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">🕐</span>
          <span>{formatarDataHora(deteccao.dataDeteccao)}</span>
        </div>
        {deteccao.magnitude !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">📊</span>
            <span>
              Magnitude: <strong className="text-slate-300">{deteccao.magnitude.toFixed(1)}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${fonte.cor}`}>
            {fonte.label}
          </span>
          {deteccao.escopo && (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${escopoCor}`}>
              {deteccao.escopo}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {deteccao.link && (
            <a
              href={deteccao.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Detalhes ↗
            </a>
          )}
          <Button size="sm" variant="primary" onClick={() => onCriarOcorrencia(deteccao)}>
            + Criar Ocorrência
          </Button>
        </div>
      </div>
    </div>
  );
}

type Estado =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; dados: DeteccaoExterna[]; escopoEONET: string | null }
  | { status: 'erro'; mensagem: string };

export function DeteccoesPage() {
  const [estado, setEstado] = useState<Estado>({ status: 'idle' });
  const [filtroFonte, setFiltroFonte] = useState<'Todos' | 'NASA-EONET' | 'USGS'>('Todos');
  const navigate = useNavigate();

  async function carregar() {
    setEstado({ status: 'loading' });
    try {
      const [eonet, usgs] = await Promise.allSettled([buscarEventosEONET(), buscarTerremotos()]);

      const dados: DeteccaoExterna[] = [];
      let escopoEONET: string | null = null;

      if (eonet.status === 'fulfilled' && eonet.value.length > 0) {
        dados.push(...eonet.value);
        // Descobre qual escopo foi usado (todos os eventos EONET terão o mesmo)
        escopoEONET = eonet.value[0].escopo ?? 'Global';
      }
      if (usgs.status === 'fulfilled') dados.push(...usgs.value);

      dados.sort(
        (a, b) => new Date(b.dataDeteccao).getTime() - new Date(a.dataDeteccao).getTime(),
      );

      if (dados.length === 0 && eonet.status === 'rejected' && usgs.status === 'rejected') {
        setEstado({
          status: 'erro',
          mensagem: 'Não foi possível conectar às APIs externas. Verifique sua conexão.',
        });
      } else {
        setEstado({ status: 'ok', dados, escopoEONET });
      }
    } catch {
      setEstado({ status: 'erro', mensagem: 'Erro inesperado ao buscar detecções.' });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function handleCriarOcorrencia(d: DeteccaoExterna) {
    const descricao =
      `${d.tipoEvento} detectado automaticamente via satélite (${d.satelite}). ` +
      `Localização: ${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}. ` +
      (d.magnitude !== undefined ? `Magnitude: ${d.magnitude.toFixed(1)}. ` : '') +
      `Fonte: ${d.fonte}. Detecção em: ${formatarDataHora(d.dataDeteccao)}.`;

    const dataInicio = d.dataDeteccao.split('T')[0];

    navigate('/ocorrencias/nova', {
      state: { deteccao: { descricao, dataInicio } },
    });
  }

  const deteccoes = estado.status === 'ok' ? estado.dados : [];
  const filtradas =
    filtroFonte === 'Todos' ? deteccoes : deteccoes.filter((d) => d.fonte === filtroFonte);

  const totalEonet = deteccoes.filter((d) => d.fonte === 'NASA-EONET').length;
  const totalUsgs = deteccoes.filter((d) => d.fonte === 'USGS').length;
  const escopoEONET = estado.status === 'ok' ? estado.escopoEONET : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detecções via Satélite"
        description="Eventos naturais detectados em tempo real por satélites da NASA (EONET) e redes sismográficas do USGS"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={carregar}
            loading={estado.status === 'loading'}
          >
            ↻ Atualizar
          </Button>
        }
      />

      {/* Aviso de escopo global quando não há eventos no Brasil */}
      {escopoEONET === 'Global' && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
          <span className="font-semibold">Escopo ampliado:</span> nenhum evento ativo foi
          encontrado no Brasil ou na América do Sul no momento. Exibindo os eventos globais mais
          recentes catalogados pela NASA EONET.
        </div>
      )}

      {escopoEONET === 'América do Sul' && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
          <span className="font-semibold">Escopo ampliado:</span> sem eventos ativos no Brasil no
          momento. Exibindo eventos da América do Sul detectados pela NASA EONET.
        </div>
      )}

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total de Detecções',
            valor: deteccoes.length,
            cor: 'text-slate-200',
            bg: 'bg-slate-800 border-slate-700',
          },
          {
            label: 'NASA EONET',
            valor: totalEonet,
            cor: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/30',
          },
          {
            label: 'USGS Sismos',
            valor: totalUsgs,
            cor: 'text-violet-400',
            bg: 'bg-violet-500/10 border-violet-500/30',
          },
        ].map(({ label, valor, cor, bg }) => (
          <div key={label} className={`rounded-xl border ${bg} px-4 py-3 text-center`}>
            <p className={`text-2xl font-bold ${cor}`}>
              {estado.status === 'loading' ? '…' : valor}
            </p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      {estado.status === 'ok' && deteccoes.length > 0 && (
        <div className="flex gap-2">
          {(['Todos', 'NASA-EONET', 'USGS'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroFonte(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filtroFonte === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'Todos'
                ? `Todos (${deteccoes.length})`
                : f === 'NASA-EONET'
                ? `NASA EONET (${totalEonet})`
                : `USGS Sismos (${totalUsgs})`}
            </button>
          ))}
        </div>
      )}

      {/* Legenda de escopos */}
      {estado.status === 'ok' && totalEonet > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span>Escopo NASA EONET:</span>
          {(['Brasil', 'América do Sul', 'Global'] as const).map((e) => (
            <span key={e} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${ESCOPO_CONFIG[e]}`}>
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      {estado.status === 'loading' && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-4xl animate-pulse">🛰️</div>
              <p className="text-sm text-slate-400">Consultando NASA EONET e USGS…</p>
              <p className="text-xs text-slate-600">Isso pode levar alguns segundos</p>
            </div>
          </CardContent>
        </Card>
      )}

      {estado.status === 'erro' && (
        <Card>
          <CardContent>
            <EmptyState
              icon="⚠️"
              title="Erro ao buscar detecções"
              description={estado.mensagem}
              action={
                <Button variant="primary" size="sm" onClick={carregar}>
                  Tentar novamente
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {estado.status === 'ok' && filtradas.length === 0 && (
        <EmptyState
          icon="🛰️"
          title="Nenhuma detecção no momento"
          description="As APIs não retornaram eventos ativos para o filtro selecionado."
        />
      )}

      {estado.status === 'ok' && filtradas.length > 0 && (
        <div>
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-slate-200">
                {filtradas.length} evento{filtradas.length !== 1 ? 's' : ''} detectado
                {filtradas.length !== 1 ? 's' : ''}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  — clique em "Criar Ocorrência" para registrar no sistema
                </span>
              </p>
            </CardHeader>
          </Card>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtradas.map((d) => (
              <DeteccaoCard
                key={`${d.fonte}-${d.id}`}
                deteccao={d}
                onCriarOcorrencia={handleCriarOcorrencia}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
