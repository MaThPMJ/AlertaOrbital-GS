import { PageHeader } from '../components/layout/PageHeader';

interface Integrante {
  nome: string;
  rm: string;
  turma: string;
  foto: string;
  github: string;
  linkedin: string;
}

const integrantes: Integrante[] = [
  {
    nome: 'Davi Isac Colin Pereira',
    rm: 'RM567265',
    turma: '1TDSPR',
    foto: '/integrantes/davi.png',
    github: 'https://github.com/klaanyz',
    linkedin: 'https://www.linkedin.com/in/davi-isac-a1a774372/',
  },
  {
    nome: 'Matheus Peres',
    rm: 'RM567300',
    turma: '1TDSPR',
    foto: '/integrantes/Matheus.jpg',
    github: 'https://github.com/MaThPMJ',
    linkedin: 'https://www.linkedin.com/in/matheus10122002/',
  },
  {
    nome: 'Pedro Gonçalves',
    rm: 'RM567651',
    turma: '1TDSPR',
    foto: '/integrantes/Pedro.jpg',
    github: 'https://github.com/PxdroGoncalves',
    linkedin: 'https://www.linkedin.com/in/pedro-gon%C3%A7alves-23561b389/',
  },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function IntegrantesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrantes"
        description="Equipe responsável pelo desenvolvimento do AlertaOrbital"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrantes.map((integrante) => (
          <div
            key={integrante.rm}
            className="flex flex-col items-center rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 text-center backdrop-blur-sm transition hover:border-slate-600/80 hover:bg-slate-800/70"
          >
            <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-blue-500/40">
              <img
                src={integrante.foto}
                alt={`Foto de ${integrante.nome}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(integrante.nome)}&background=1e40af&color=fff&size=128`;
                }}
              />
            </div>

            <h2 className="text-base font-semibold text-slate-100">{integrante.nome}</h2>

            <div className="mt-2 flex flex-col gap-1">
              <span className="text-sm text-slate-400">
                <span className="font-medium text-slate-300">{integrante.rm}</span>
              </span>
              <span className="text-sm text-slate-500">Turma: {integrante.turma}</span>
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href={integrante.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub de ${integrante.nome}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                <GitHubIcon />
                GitHub
              </a>
              <a
                href={integrante.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn de ${integrante.nome}`}
                className="flex items-center gap-1.5 rounded-lg border border-blue-700/50 bg-blue-900/20 px-3 py-2 text-xs font-medium text-blue-300 transition hover:border-blue-500 hover:text-blue-200"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
