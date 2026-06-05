interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Erro ao carregar dados',
  message = 'Ocorreu um problema ao buscar as informações. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 py-16 text-center">
      <span className="text-4xl" aria-hidden>⚠️</span>
      <div className="space-y-1">
        <p className="font-medium text-red-300">{title}</p>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
