import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  colorClass: string;
  trend?: string;
}

export function StatCard({ label, value, icon, colorClass, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-xl', colorClass)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {trend && <p className="text-xs text-slate-500">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
