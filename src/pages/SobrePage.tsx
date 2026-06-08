import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const tecnologias = [
  { nome: 'React + TypeScript', descricao: 'Interface moderna e tipada', icone: '⚛️' },
  { nome: 'Python + FastAPI', descricao: 'API backend de alta performance', icone: '🐍' },
  { nome: 'Oracle Database', descricao: 'Persistência de dados robusta', icone: '🗄️' },
  { nome: 'NASA / ESA / INPE', descricao: 'Dados de satélites em tempo real', icone: '🛰️' },
  { nome: 'Tailwind CSS', descricao: 'Estilização utilitária e responsiva', icone: '🎨' },
  { nome: 'TanStack Query', descricao: 'Gerenciamento de estado assíncrono', icone: '🔄' },
];

const funcionalidades = [
  { titulo: 'Monitoramento de Ocorrências', descricao: 'Registro e acompanhamento de desastres naturais em tempo real com dados provenientes de satélites.' },
  { titulo: 'Gestão de Satélites', descricao: 'Visualização e controle dos satélites monitorando regiões específicas do território nacional.' },
  { titulo: 'Relatórios e Análises', descricao: 'Geração de relatórios detalhados sobre ocorrências, distribuições por tipo e região.' },
  { titulo: 'Sistema de Alertas', descricao: 'Classificação de severidade e status para priorizar resposta a emergências.' },
];

export function SobrePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sobre o AlertaOrbital"
        description="Sistema de monitoramento de desastres naturais via satélite"
      />

      {/* Descrição principal */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">O Projeto</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-slate-400">
            <p>
              O <span className="font-semibold text-slate-200">AlertaOrbital</span> é um sistema de
              monitoramento e gestão de desastres naturais desenvolvido como projeto da{' '}
              <span className="text-blue-400">Global Solution — FIAP 2025</span>. A plataforma
              integra dados de agências espaciais como NASA, ESA e INPE para fornecer informações
              precisas e em tempo real sobre ocorrências no território brasileiro.
            </p>
            <p>
              A proposta nasce da necessidade de centralizar informações fragmentadas sobre eventos
              climáticos extremos — enchentes, queimadas, deslizamentos e outros — em uma única
              interface acessível a gestores de emergência, pesquisadores e autoridades públicas.
            </p>
            <p>
              Com o AlertaOrbital, é possível registrar ocorrências, acompanhar satélites ativos,
              analisar padrões por região e tipo de desastre, e gerar relatórios para embasar
              decisões rápidas em situações críticas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">Funcionalidades</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {funcionalidades.map((f) => (
              <div key={f.titulo} className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-4">
                <h3 className="text-sm font-medium text-slate-200">{f.titulo}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tecnologias */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">Tecnologias Utilizadas</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tecnologias.map((t) => (
              <div key={t.nome} className="flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-900/50 p-3">
                <span className="text-xl" aria-hidden>{t.icone}</span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{t.nome}</p>
                  <p className="text-xs text-slate-500">{t.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contexto acadêmico */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-2xl">
              🎓
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">FIAP — Global Solution 2025</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Curso de Análise e Desenvolvimento de Sistemas · 2º Semestre
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
