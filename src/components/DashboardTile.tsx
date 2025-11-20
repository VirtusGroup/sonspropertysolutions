import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
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
          "h-12 w-12 mb-2",
          variant === 'primary' ? "text-accent-foreground" : "text-primary"
        )} />
        {badge !== undefined && badge > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
          >
            {badge > 9 ? '9+' : badge}
          </Badge>
        )}
      </div>
      <span className={cn(
        "text-xs font-medium text-center line-clamp-2 leading-tight",
        variant === 'primary' ? "text-accent-foreground" : "text-foreground"
      )}>
        {label}
      </span>
    </>
  );

  const className = cn(
    "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    disabled && "opacity-50 cursor-not-allowed",
    !disabled && "active:scale-95 hover:scale-105",
    variant === 'primary' 
      ? "bg-accent hover:bg-accent/90" 
      : "bg-card hover:bg-accent/10 border border-border"
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
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
