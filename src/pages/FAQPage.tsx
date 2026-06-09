import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { cn } from '../lib/utils';

interface FaqItem {
  pergunta: string;
  resposta: string;
}

const faqs: FaqItem[] = [
  {
    pergunta: 'O que é o AlertaOrbital?',
    resposta:
      'O AlertaOrbital é uma plataforma de monitoramento de desastres naturais que utiliza dados de satélites das agências NASA, ESA e INPE para registrar, acompanhar e analisar ocorrências no território brasileiro.',
  },
  {
    pergunta: 'Como os dados de satélite são obtidos?',
    resposta:
      'Os dados são integrados por meio de APIs públicas das agências espaciais NASA, ESA e INPE. As informações incluem imagens, coordenadas e parâmetros ambientais que permitem identificar e classificar desastres naturais em tempo real.',
  },
  {
    pergunta: 'Quais tipos de desastres são monitorados?',
    resposta:
      'O sistema monitora enchentes, queimadas, deslizamentos de terra, secas e outros eventos climáticos extremos. Cada ocorrência é classificada por tipo, severidade, região e status de atendimento.',
  },
  {
    pergunta: 'Como registrar uma nova ocorrência?',
    resposta:
      'Acesse o menu "Nova Ocorrência" na barra lateral. Preencha os campos obrigatórios — tipo de desastre, região, data de início, severidade e descrição — e salve o registro. A ocorrência ficará disponível no Dashboard e na lista de Ocorrências.',
  },
  {
    pergunta: 'O que significa cada status de ocorrência?',
    resposta:
      'Os status disponíveis são: Ativa (em curso, requer atenção imediata), Controlada (sob monitoramento, sem expansão) e Resolvida (encerrada com sucesso). Os status podem ser atualizados conforme a evolução do evento.',
  },
  {
    pergunta: 'Como funciona a classificação de severidade?',
    resposta:
      'A severidade indica o impacto estimado da ocorrência: Baixa (impacto limitado), Média (impacto moderado com risco a populações), Alta (impacto severo) e Crítica (emergência com risco de vida imediato). Essa classificação orienta a prioridade de resposta.',
  },
  {
    pergunta: 'Posso editar ou excluir uma ocorrência?',
    resposta:
      'Sim. Acesse os detalhes de qualquer ocorrência e utilize as opções de edição disponíveis para atualizar informações. A exclusão está disponível para registros que não possuem vínculos ativos com relatórios gerados.',
  },
  {
    pergunta: 'Os relatórios podem ser exportados?',
    resposta:
      'Sim, a seção Relatórios permite visualizar análises consolidadas por período, tipo de desastre e região. A funcionalidade de exportação em PDF está prevista em versões futuras da plataforma.',
  },
];

const contatos = [
  { label: 'Davi Isac', email: 'davi_isac@outlook.com.br', github: 'https://github.com/klaanyz' },
  { label: 'Matheus Peres', email: 'matheusperes220@fiap.com.br', github: 'https://github.com/MaThPMJ' },
  { label: 'Pedro Gonçalves', email: 'pedrogoncalvesr89@gmail.com', github: 'https://github.com/PxdroGoncalves' },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export function FAQPage() {
  const [aberto, setAberto] = useState<number | null>(null);

  const toggle = (i: number) => setAberto((prev) => (prev === i ? null : i));

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ & Contato"
        description="Perguntas frequentes e canais de contato da equipe"
      />

      {/* FAQ Accordion */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">Perguntas Frequentes</h2>
        </CardHeader>
        <div className="divide-y divide-slate-700/60">
          {faqs.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-700/20"
                aria-expanded={aberto === i}
              >
                <span className="text-sm font-medium text-slate-200">{item.pergunta}</span>
                <ChevronIcon open={aberto === i} />
              </button>
              {aberto === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm leading-relaxed text-slate-400">{item.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">Entre em Contato</h2>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-400">
            Dúvidas, sugestões ou problemas? Entre em contato diretamente com a equipe de
            desenvolvimento.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {contatos.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-4"
              >
                <p className="text-sm font-medium text-slate-200">{c.label}</p>
                <a
                  href={`mailto:${c.email}`}
                  className="mt-1 block text-xs text-blue-400 hover:text-blue-300"
                >
                  {c.email}
                </a>
                <a
                  href={c.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-xs text-slate-500 hover:text-slate-300"
                >
                  {c.github.replace('https://', '')}
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
