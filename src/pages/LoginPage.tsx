import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, gerarEmailOrbital } from '../contexts/AuthContext';
import { listarUsuarios } from '../services/usuarioService';

const SENHA_PADRAO = '123456';

const CREDENCIAIS_EXEMPLO = [
  { nome: 'Ana Souza', cargo: 'Analista de Defesa Civil' },
  { nome: 'Carlos Lima', cargo: 'Operador Sênior' },
  { nome: 'Mariana Torres', cargo: 'Gestora de Emergências' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarCredenciais, setMostrarCredenciais] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !senha.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }

    if (senha !== SENHA_PADRAO) {
      setError('Senha incorreta.');
      return;
    }

    setLoading(true);
    try {
      const usuarios = await listarUsuarios();
      const usuario = usuarios.find(
        (u) => gerarEmailOrbital(u.nome) === email.toLowerCase().trim(),
      );

      if (!usuario) {
        setError('E-mail não cadastrado no sistema. Use o padrão nome.sobrenome@orbital.com');
        return;
      }

      login(usuario);
      navigate('/', { replace: true });
    } catch {
      setError('Erro ao conectar com o sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function preencherCredencial(nome: string) {
    setEmail(gerarEmailOrbital(nome));
    setSenha(SENHA_PADRAO);
    setError('');
    setMostrarCredenciais(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-lg shadow-blue-600/30">
            🛰️
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-100">AlertaOrbital</h1>
            <p className="text-sm text-slate-500">Monitoramento via satélite</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900 p-8 shadow-xl">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
            Acesso ao sistema
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-slate-400">
                E-mail institucional
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome.sobrenome@orbital.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="senha" className="block text-xs font-medium text-slate-400">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setError(''); }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Credenciais de acesso */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setMostrarCredenciais((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-800/40"
          >
            <span className="text-xs font-medium text-slate-500">
              Usuários cadastrados — senha: <span className="font-mono text-slate-400">123456</span>
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-3.5 w-3.5 text-slate-600 transition-transform ${mostrarCredenciais ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mostrarCredenciais && (
            <div className="border-t border-slate-800 px-4 pb-3">
              <p className="py-2 text-xs text-slate-600">Clique para preencher automaticamente:</p>
              <ul className="space-y-1.5">
                {CREDENCIAIS_EXEMPLO.map(({ nome, cargo }) => (
                  <li key={nome}>
                    <button
                      type="button"
                      onClick={() => preencherCredencial(nome)}
                      className="w-full rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-left transition hover:border-blue-500/40 hover:bg-blue-500/5"
                    >
                      <p className="text-xs font-medium text-slate-300">{nome}</p>
                      <p className="text-xs text-slate-600">{gerarEmailOrbital(nome)}</p>
                      <p className="text-xs text-slate-600">{cargo}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
