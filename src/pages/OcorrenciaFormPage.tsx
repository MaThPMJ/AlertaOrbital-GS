import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCadastrarOcorrencia, useEditarOcorrencia, useOcorrencia } from '../hooks/useOcorrencias';
import { useRegioes } from '../hooks/useRegioes';
import { useTiposDesastre } from '../hooks/useTiposDesastre';
import { criarTipoDesastre } from '../services/tipoDesastreService';
import { criarRegiao } from '../services/regiaoService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { PageLoading } from '../components/ui/LoadingSpinner';
import type { OcorrenciaFormData, TipoDesastre, Regiao } from '../types';

interface FormErrors {
  tipoDesastreId?: string;
  regiaoId?: string;
  dataInicio?: string;
  descricao?: string;
}

const INITIAL_DATA: OcorrenciaFormData = {
  tipoDesastreId: 0,
  regiaoId: 0,
  dataInicio: '',
  dataFim: undefined,
  descricao: '',
  areaAfetadaKm2: undefined,
  populacaoAfetada: undefined,
};


const NIVEIS_RISCO = [
  { value: 'BAIXO', label: 'Baixo' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'ALTO', label: 'Alto' },
  { value: 'CRITICO', label: 'Crítico' },
];

function erroLegivel(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes('ORA-00001') || msg.toLowerCase().includes('unique constraint')) {
    return 'Já existe um registro com este nome no banco de dados.';
  }
  // Extrai só a parte relevante sem a URL do Oracle
  const match = msg.match(/"erro"\s*:\s*"([^"]+)"/);
  if (match) return match[1].split('\n')[0];
  return msg.length > 120 ? msg.slice(0, 120) + '…' : msg;
}

// ─── Painel: Novo Tipo ────────────────────────────────────────────────────────
function NovoTipoPanel({
  onSalvo,
  onCancelar,
}: {
  onSalvo: (tipo: TipoDesastre) => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nivelRisco, setNivelRisco] = useState('ALTO');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar() {
    if (!nome.trim()) return;
    setSalvando(true);
    setErro('');
    try {
      const tipo = await criarTipoDesastre({
        nome: nome.trim(),
        descricao: descricao.trim() || nome.trim(),
        nivelRisco,
      });
      onSalvo(tipo);
    } catch (e) {
      setErro(erroLegivel(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
      <p className="text-xs font-semibold text-blue-300">Cadastrar novo tipo de desastre</p>
      <div className="space-y-3">
        <Input
          label="Nome do tipo *"
          placeholder="ex.: Terremoto"
          value={nome}
          onChange={(e) => { setNome(e.target.value); setErro(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); salvar(); } }}
        />
        <Input
          label="Descrição"
          placeholder="ex.: Abalo sísmico causado por movimentos tectônicos"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <Select
          label="Nível de Risco"
          options={NIVEIS_RISCO}
          value={nivelRisco}
          onChange={(e) => setNivelRisco(e.target.value)}
        />
        {erro && <p className="text-xs text-red-400">{erro}</p>}
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="primary" loading={salvando} disabled={!nome.trim()} onClick={salvar}>
            Salvar
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Painel: Nova Região ──────────────────────────────────────────────────────
const PAISES_SUL_AMERICA = [
  'Argentina', 'Bolívia', 'Brasil', 'Chile', 'Colômbia', 'Equador',
  'Guiana', 'Guiana Francesa', 'Paraguai', 'Peru', 'Suriname', 'Uruguai', 'Venezuela',
];

function NovaRegiaoPanel({
  onSalva,
  onCancelar,
}: {
  onSalva: (regiao: Regiao) => void;
  onCancelar: () => void;
}) {
  const [cidade, setCidade] = useState('');
  const [pais, setPais] = useState('Brasil');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar() {
    if (!cidade.trim()) return;
    setSalvando(true);
    setErro('');
    try {
      const regiao = await criarRegiao({ cidade: cidade.trim(), pais });
      onSalva(regiao);
    } catch (e) {
      setErro(erroLegivel(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
      <p className="text-xs font-semibold text-blue-300">Cadastrar nova região</p>
      <div className="space-y-3">
        <Input
          label="Nome da região *"
          placeholder="ex.: Cordilheira dos Andes, Vale do Paraná"
          value={cidade}
          onChange={(e) => { setCidade(e.target.value); setErro(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); salvar(); } }}
        />
        <Select
          label="País"
          options={PAISES_SUL_AMERICA.map((p) => ({ value: p, label: p }))}
          value={pais}
          onChange={(e) => setPais(e.target.value)}
        />
        {erro && <p className="text-xs text-red-400">{erro}</p>}
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="primary" loading={salvando} disabled={!cidade.trim()} onClick={salvar}>
            Salvar
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function OcorrenciaFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const numId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const deteccaoState = (
    location.state as { deteccao?: { descricao: string; dataInicio: string } } | null
  )?.deteccao;

  const { data: tiposApi = [], isLoading: loadingTipos } = useTiposDesastre();
  const { data: regioesApi = [], isLoading: loadingRegioes } = useRegioes();

  // Itens criados na sessão ficam no estado local — aparecem imediatamente
  const [tiposExtras, setTiposExtras] = useState<TipoDesastre[]>([]);
  const [regioesExtras, setRegioesExtras] = useState<Regiao[]>([]);

  const tipos = [...tiposApi, ...tiposExtras].sort((a, b) => a.nome.localeCompare(b.nome));
  const regioes = [...regioesApi, ...regioesExtras].sort((a, b) => a.nome.localeCompare(b.nome));

  const { data: ocorrenciaExistente, isLoading: loadingOcorrencia } = useOcorrencia(numId);
  const { mutate: cadastrar, isPending: cadastrando, error: erroCadastro } = useCadastrarOcorrencia();
  const { mutate: editar, isPending: editando, error: erroEdicao } = useEditarOcorrencia();

  const isPending = cadastrando || editando;
  const error = erroCadastro ?? erroEdicao;

  const [form, setForm] = useState<OcorrenciaFormData>(
    deteccaoState && !isEditing
      ? { ...INITIAL_DATA, descricao: deteccaoState.descricao, dataInicio: deteccaoState.dataInicio }
      : INITIAL_DATA,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [initialized, setInitialized] = useState(false);
  const [showNovoTipo, setShowNovoTipo] = useState(false);
  const [showNovaRegiao, setShowNovaRegiao] = useState(false);

  useEffect(() => {
    if (isEditing && ocorrenciaExistente && !initialized) {
      setForm({
        tipoDesastreId: ocorrenciaExistente.tipoDesastre.id,
        regiaoId: ocorrenciaExistente.regiao.id,
        dataInicio: ocorrenciaExistente.dataInicio,
        dataFim: ocorrenciaExistente.dataFim,
        descricao: ocorrenciaExistente.descricao,
        areaAfetadaKm2: ocorrenciaExistente.areaAfetadaKm2,
        populacaoAfetada: ocorrenciaExistente.populacaoAfetada,
      });
      setInitialized(true);
    }
  }, [ocorrenciaExistente, initialized, isEditing]);

  if (isEditing && loadingOcorrencia) return <PageLoading />;

  function validate(): boolean {
    const erros: FormErrors = {};
    if (!form.tipoDesastreId) erros.tipoDesastreId = 'Selecione o tipo de desastre.';
    if (!form.regiaoId) erros.regiaoId = 'Selecione a região afetada.';
    if (!form.dataInicio) {
      erros.dataInicio = 'Informe a data de início.';
    } else if (new Date(form.dataInicio) > new Date()) {
      erros.dataInicio = 'A data de início não pode ser no futuro.';
    }
    if (!form.descricao.trim()) {
      erros.descricao = 'Descreva o evento.';
    } else if (form.descricao.trim().length < 20) {
      erros.descricao = 'A descrição deve ter pelo menos 20 caracteres.';
    }
    setErrors(erros);
    return Object.keys(erros).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (isEditing && ocorrenciaExistente) {
      editar(
        { id: numId, dados: form, statusAtual: ocorrenciaExistente.status },
        { onSuccess: (atualizada) => navigate(`/ocorrencias/${atualizada.id}`) },
      );
    } else {
      cadastrar(form, {
        onSuccess: (nova) => navigate(`/ocorrencias/${nova.id}`),
      });
    }
  }

  function update<K extends keyof OcorrenciaFormData>(key: K, value: OcorrenciaFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? `Editar Ocorrência #${numId}` : 'Nova Ocorrência'}
        description={
          isEditing
            ? 'Atualize as informações do evento registrado'
            : 'Registre um novo evento de desastre natural no sistema'
        }
        action={
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            ← Voltar
          </Button>
        }
      />

      {deteccaoState && !isEditing && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
          <span className="font-semibold">Pré-preenchido via detecção de satélite</span> — selecione
          o tipo e a região e confirme o cadastro.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Formulário de ocorrência">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-200">Identificação do Evento</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Tipo de Desastre */}
                  <div>
                    <Select
                      label="Tipo de Desastre"
                      required
                      placeholder="Selecione…"
                      options={tipos.map((t) => ({ value: t.id, label: t.nome }))}
                      value={form.tipoDesastreId || ''}
                      onChange={(e) => { update('tipoDesastreId', Number(e.target.value)); setShowNovoTipo(false); }}
                      error={errors.tipoDesastreId}
                      disabled={loadingTipos}
                    />
                    {!showNovoTipo ? (
                      <button
                        type="button"
                        onClick={() => setShowNovoTipo(true)}
                        className="mt-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        + Cadastrar novo tipo
                      </button>
                    ) : (
                      <NovoTipoPanel
                        onSalvo={(tipo) => {
                          setTiposExtras((prev) => [...prev, tipo]);
                          update('tipoDesastreId', tipo.id);
                          setShowNovoTipo(false);
                        }}
                        onCancelar={() => setShowNovoTipo(false)}
                      />
                    )}
                  </div>

                  {/* Região Afetada */}
                  <div>
                    <Select
                      label="Região Afetada"
                      required
                      placeholder="Selecione…"
                      options={regioes.map((r) => ({
                        value: r.id,
                        label: `${r.nome} (${r.pais})`,
                      }))}
                      value={form.regiaoId || ''}
                      onChange={(e) => { update('regiaoId', Number(e.target.value)); setShowNovaRegiao(false); }}
                      error={errors.regiaoId}
                      disabled={loadingRegioes}
                    />
                    {!showNovaRegiao ? (
                      <button
                        type="button"
                        onClick={() => setShowNovaRegiao(true)}
                        className="mt-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        + Cadastrar nova região
                      </button>
                    ) : (
                      <NovaRegiaoPanel
                        onSalva={(regiao) => {
                          setRegioesExtras((prev) => [...prev, regiao]);
                          update('regiaoId', regiao.id);
                          setShowNovaRegiao(false);
                        }}
                        onCancelar={() => setShowNovaRegiao(false)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Data de Início"
                    type="date"
                    required
                    max={hoje}
                    value={form.dataInicio}
                    onChange={(e) => update('dataInicio', e.target.value)}
                    error={errors.dataInicio}
                  />
                  <Input
                    label="Data de Encerramento"
                    type="date"
                    min={form.dataInicio || undefined}
                    max={hoje}
                    value={form.dataFim ?? ''}
                    onChange={(e) => update('dataFim', e.target.value || undefined)}
                    hint="Preencha ao resolver o evento"
                  />
                </div>

                <Textarea
                  label="Descrição"
                  required
                  placeholder="Descreva o evento com detalhes sobre a extensão, causas e impactos observados…"
                  rows={4}
                  value={form.descricao}
                  onChange={(e) => update('descricao', e.target.value)}
                  error={errors.descricao}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-200">Estimativas (opcional)</h2>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Área Afetada (km²)"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="ex.: 1500"
                    value={form.areaAfetadaKm2 ?? ''}
                    onChange={(e) =>
                      update('areaAfetadaKm2', e.target.value ? Number(e.target.value) : undefined)
                    }
                    hint="Estimativa da área de impacto direto"
                  />
                  <Input
                    label="População Afetada"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="ex.: 50000"
                    value={form.populacaoAfetada ?? ''}
                    onChange={(e) =>
                      update('populacaoAfetada', e.target.value ? Number(e.target.value) : undefined)
                    }
                    hint="Número estimado de pessoas impactadas"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel lateral */}
          <div className="space-y-6">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-slate-200">Status Atual</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">
                    O status é gerenciado pelo ciclo de vida na tela de detalhes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-slate-200">Status Inicial</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-red-300">Ativo</p>
                      <p className="text-xs text-slate-500">Toda nova ocorrência inicia como Ativa.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-200">
                  {isEditing ? 'Sobre a Edição' : 'Sobre o Cadastro'}
                </h2>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-500">
                {isEditing ? (
                  <>
                    <p>• Alterações são salvas imediatamente após confirmar.</p>
                    <p>• Para mudar o status, use o botão na tela de detalhes.</p>
                    <p>• Preencha a Data de Encerramento ao resolver o evento.</p>
                  </>
                ) : (
                  <>
                    <p>• Não encontrou o tipo ou região? Use <strong className="text-slate-400">+ Cadastrar</strong> abaixo do campo.</p>
                    <p>• O evento será registrado com status <strong className="text-slate-400">Ativo</strong>.</p>
                    <p>• Ciclo: <strong className="text-red-400">Ativo</strong> → <strong className="text-amber-400">Controlado</strong> → <strong className="text-emerald-400">Resolvido</strong>.</p>
                  </>
                )}
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {(error as Error).message}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" loading={isPending} className="w-full justify-center">
                {isPending ? 'Salvando…' : isEditing ? 'Salvar Alterações' : 'Cadastrar Ocorrência'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="w-full justify-center">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
