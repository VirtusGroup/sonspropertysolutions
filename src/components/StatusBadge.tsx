import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  'on-site': {
    label: 'On-Site',
    variant: 'default',
    icon: Truck,
  },
  completed: {
    label: 'Completed',
    variant: 'outline',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: Package,
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
