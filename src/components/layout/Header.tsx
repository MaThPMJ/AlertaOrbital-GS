import { useNavigate } from 'react-router-dom';
import { useApiStatus } from '../../lib/apiStatus';
import { useAuth, getIniciais } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const apiStatus = useApiStatus();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const now = new Date().toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-700/60 bg-slate-900/80 px-4 backdrop-blur-sm lg:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Abrir menu de navegação"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div className="hidden items-center gap-2 text-xs text-slate-500 lg:flex">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {now}
      </div>

      <div className="flex items-center gap-3">
        {apiStatus === 'live' ? (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
            <span className="text-xs font-medium text-emerald-400">API ao vivo</span>
          </div>
        ) : (
          <div
            title="A API está indisponível. Os dados exibidos são simulados (mock)."
            className="flex cursor-help items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
            <span className="text-xs font-medium text-amber-400">Dados simulados</span>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            <div
              title={user.nome}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/30 text-xs font-bold text-blue-300"
            >
              {getIniciais(user.nome)}
            </div>
            <span className="hidden text-xs text-slate-400 lg:block">{user.papel}</span>
            <button
              type="button"
              onClick={handleLogout}
              title="Sair da conta"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-300">
            --
          </div>
        )}
      </div>
    </header>
  );
}
