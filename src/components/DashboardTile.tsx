import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DashboardTileProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
  disabled?: boolean;
  variant?: 'default' | 'primary';
  index?: number;
}

export function DashboardTile({
  icon: Icon,
  label,
  href,
  onClick,
  badge,
  disabled = false,
  variant = 'default',
}: DashboardTileProps) {
  const content = (
    <>
      <div className="relative">
        <Icon className={cn(
          "h-8 w-8 mb-1.5 transition-transform duration-200",
          variant === 'primary' ? "text-accent-foreground" : "text-primary"
        )} />
        {badge !== undefined && badge > 0 && (
          <div className="absolute -top-1 -right-1">
            <Badge 
              variant="secondary" 
              className="h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground"
            >
              {badge > 9 ? '9+' : badge}
            </Badge>
          </div>
        )}
      </div>
      <span className={cn(
        "text-[10px] font-medium text-center line-clamp-2 leading-tight",
        variant === 'primary' ? "text-accent-foreground" : "text-foreground"
      )}>
        {label}
      </span>
    </>
  );

  const className = cn(
    "flex flex-col items-center justify-center p-2 rounded-lg aspect-square w-full",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    disabled && "opacity-50 cursor-not-allowed",
    variant === 'primary' 
      ? "bg-accent" 
      : "bg-card/90 border border-border backdrop-blur-sm"
  );

  if (disabled) {
    return (
      <div className={className} title="Coming soon">
        {content}
      </div>
    );
  }

  if (href) {
    return (
      <motion.div whileTap={{ scale: 0.95 }}>
        <Link to={href} className={className}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <button onClick={onClick} className={className}>
        {content}
      </button>
    </motion.div>
  );
}
