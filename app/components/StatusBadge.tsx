import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { ServiceStatus } from '../types';

interface StatusBadgeProps {
  status: ServiceStatus;
  showIcon?: boolean;
}

export default function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = {
    operational: {
      label: 'Operational',
      color: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    degraded: {
      label: 'Degraded Performance',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    'partial-outage': {
      label: 'Partial Outage',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400',
      icon: <AlertCircle className="w-4 h-4" />,
    },
    'major-outage': {
      label: 'Major Outage',
      color: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const { label, color, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {showIcon && icon}
      {label}
    </span>
  );
}
