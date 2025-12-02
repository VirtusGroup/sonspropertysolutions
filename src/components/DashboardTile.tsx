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
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.03 + 0.1, duration: 0.3 }}
      >
        <Icon className={cn(
          "h-8 w-8 mb-1.5 transition-transform duration-200",
          variant === 'primary' ? "text-accent-foreground" : "text-primary"
        )} />
        {badge !== undefined && badge > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.03 + 0.2, type: 'spring', stiffness: 500 }}
          >
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground"
            >
              {badge > 9 ? '9+' : badge}
            </Badge>
          </motion.div>
        )}
      </motion.div>
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

  const MotionWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.03,
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      className="h-full"
    >
      {children}
    </motion.div>
  );

  if (disabled) {
    return (
      <MotionWrapper>
        <div className={className} title="Coming soon">
          {content}
        </div>
      </MotionWrapper>
    );
  }

  if (href) {
    return (
      <MotionWrapper>
        <Link to={href} className={className}>
          {content}
        </Link>
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper>
      <button onClick={onClick} className={className}>
        {content}
      </button>
    </MotionWrapper>
  );
}
