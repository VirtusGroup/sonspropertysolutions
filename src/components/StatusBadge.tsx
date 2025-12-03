import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Truck, Package, XCircle, Flag } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }
> = {
  received: {
    label: 'Received',
    variant: 'secondary',
    icon: Package,
  },
  scheduled: {
    label: 'Scheduled',
    variant: 'default',
    icon: Clock,
  },
  in_progress: {
    label: 'Job In Progress',
    variant: 'default',
    icon: Truck,
  },
  job_complete: {
    label: 'Job Complete',
    variant: 'default',
    icon: CheckCircle2,
  },
  finished: {
    label: 'Finished',
    variant: 'outline',
    icon: Flag,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: XCircle,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
