import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, CalendarPlus, ClipboardList, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/store/useStore';
import { demoUsers } from '@/lib/demoData';

interface MobileShellProps {
  children: ReactNode;
}

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/services', icon: Briefcase, label: 'Services' },
  { path: '/book', icon: CalendarPlus, label: 'Book' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/account', icon: User, label: 'Account' },
];

export function MobileShell({ children }: MobileShellProps) {
  const location = useLocation();
  const { resetDemoData, impersonateUser, togglePromos, currentUser } = useStore();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              SP
            </div>
            <span className="font-semibold text-lg">Sons Property</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-medium">Dev Menu</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetDemoData}>
                Reset Demo Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Impersonate User
              </div>
              {demoUsers.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => impersonateUser(user.id)}
                  className={cn(
                    currentUser?.id === user.id && 'bg-accent'
                  )}
                >
                  {user.name} ({user.tier})
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={togglePromos}>
                Toggle Promotions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/support">Support</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/install">PWA Install</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'fill-current')} />
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
