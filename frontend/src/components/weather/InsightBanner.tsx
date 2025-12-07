import { X, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertType } from '@/types/api';

interface InsightBannerProps {
  type: AlertType;
  message: string;
  onClose: () => void;
  className?: string;
}

const typeConfig = {
  info: {
    borderColor: 'border-blue-500/70 dark:border-blue-400/70',
    iconColor: 'text-blue-500 dark:text-blue-400',
    icon: Info,
    bgColor: 'bg-background',
  },
  warning: {
    borderColor: 'border-amber-500/70 dark:border-amber-400/70',
    iconColor: 'text-amber-500 dark:text-amber-400',
    icon: AlertTriangle,
    bgColor: 'bg-background',
  },
  danger: {
    borderColor: 'border-red-500/70 dark:border-red-400/70',
    iconColor: 'text-red-500 dark:text-red-400',
    icon: AlertCircle,
    bgColor: 'bg-background',
  },
};

export function InsightBanner({ type, message, onClose, className }: InsightBannerProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 p-4',
        config.borderColor,
        config.bgColor,
        'flex items-start gap-3',
        className
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-1">Insights</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
        aria-label="Fechar insight"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

