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
  index = 0,
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

  const motionProps = {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { 
      delay: index * 0.03,
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const
    },
    whileTap: !disabled ? { scale: 0.95 } : undefined,
  };

  if (disabled) {
    return (
      <motion.div {...motionProps}>
        <div className={className} title="Coming soon">
          {content}
        </div>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div {...motionProps}>
        <Link to={href} className={className}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div {...motionProps}>
      <button onClick={onClick} className={className}>
        {content}
      </button>
    </motion.div>
  );
}
