import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCadastrarOcorrencia, useEditarOcorrencia, useOcorrencia } from '../hooks/useOcorrencias';
import { useRegioes } from '../hooks/useRegioes';
import { useTiposDesastre } from '../hooks/useTiposDesastre';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { PageLoading } from '../components/ui/LoadingSpinner';
import type { OcorrenciaFormData } from '../types';

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

export function OcorrenciaFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const numId = Number(id);
  const navigate = useNavigate();

  const { data: tipos = [], isLoading: loadingTipos } = useTiposDesastre();
  const { data: regioes = [], isLoading: loadingRegioes } = useRegioes();

  const { data: ocorrenciaExistente, isLoading: loadingOcorrencia } = useOcorrencia(numId);

  const { mutate: cadastrar, isPending: cadastrando, error: erroCadastro } = useCadastrarOcorrencia();
  const { mutate: editar, isPending: editando, error: erroEdicao } = useEditarOcorrencia();

  const isPending = cadastrando || editando;
  const error = erroCadastro ?? erroEdicao;

  const [form, setForm] = useState<OcorrenciaFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [initialized, setInitialized] = useState(false);

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

      <form onSubmit={handleSubmit} noValidate aria-label="Formulário de ocorrência">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-200">Identificação do Evento</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Tipo de Desastre"
                    required
                    placeholder="Selecione…"
                    options={tipos.map((t) => ({ value: t.id, label: t.nome }))}
                    value={form.tipoDesastreId || ''}
                    onChange={(e) => update('tipoDesastreId', Number(e.target.value))}
                    error={errors.tipoDesastreId}
                    disabled={loadingTipos}
                    aria-required="true"
                  />
                  <Select
                    label="Região Afetada"
                    required
                    placeholder="Selecione…"
                    options={regioes.map((r) => ({
                      value: r.id,
                      label: `${r.nome} (${r.estado})`,
                    }))}
                    value={form.regiaoId || ''}
                    onChange={(e) => update('regiaoId', Number(e.target.value))}
                    error={errors.regiaoId}
                    disabled={loadingRegioes}
                    aria-required="true"
                  />
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
                    aria-required="true"
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
                  aria-required="true"
                />
              </CardContent>
            </Card>

            {/* Dados quantitativos (opcionais) */}
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
                      update(
                        'populacaoAfetada',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
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
                    O status é gerenciado pelo ciclo de vida na tela de detalhes. Aqui você edita
                    apenas os dados do evento.
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
                      <p className="text-xs text-slate-500">
                        Toda nova ocorrência é iniciada como Ativa.
                      </p>
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
                    <p>
                      • O evento será registrado com status{' '}
                      <strong className="text-slate-400">Ativo</strong>.
                    </p>
                    <p>
                      • Após salvar, você poderá vincular satélites e emitir alertas na tela de
                      detalhes.
                    </p>
                    <p>
                      • O ciclo de vida segue:{' '}
                      <strong className="text-red-400">Ativo</strong> →{' '}
                      <strong className="text-amber-400">Controlado</strong> →{' '}
                      <strong className="text-emerald-400">Resolvido</strong>.
                    </p>
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
                {isPending
                  ? 'Salvando…'
                  : isEditing
                  ? 'Salvar Alterações'
                  : 'Cadastrar Ocorrência'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="w-full justify-center"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
