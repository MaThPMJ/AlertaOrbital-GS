import type { AlertaSeveridade } from '../../types';
import { SEVERIDADE_CONFIG } from '../../lib/utils';
import { Badge } from './Badge';

interface SeveridadeBadgeProps {
  severidade: AlertaSeveridade;
}

export function SeveridadeBadge({ severidade }: SeveridadeBadgeProps) {
  const cfg = SEVERIDADE_CONFIG[severidade];
  return (
    <Badge className={`${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </Badge>
  );
}
