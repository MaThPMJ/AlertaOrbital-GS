interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'Nenhum resultado encontrado',
  description = 'Tente ajustar os filtros ou realize um novo cadastro.',
  icon = '🔍',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/30 py-16 text-center">
      <span className="text-4xl" aria-hidden>{icon}</span>
      <div className="space-y-1">
        <p className="font-medium text-slate-300">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
