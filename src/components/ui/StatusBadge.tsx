import type { OcorrenciaStatus } from '../../types';
import { STATUS_CONFIG } from '../../lib/utils';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: OcorrenciaStatus;
  withDot?: boolean;
}

export function StatusBadge({ status, withDot = true }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {withDot && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden />}
      {cfg.label}
    </Badge>
  );
}
