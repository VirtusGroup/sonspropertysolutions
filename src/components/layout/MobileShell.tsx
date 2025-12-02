import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, ClipboardList, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
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
      {/* Header with subtle glass effect */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="sticky top-0 z-50 w-full border-b bg-background"
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm"
            >
              SP
            </motion.div>
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
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* iOS 26 Liquid Glass Floating Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-5 safe-area-inset-bottom">
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="liquid-glass-nav rounded-full mx-auto max-w-md"
        >
          <div className="flex items-center justify-around h-14 px-3 relative">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className="relative flex flex-col items-center justify-center flex-1 h-full z-10"
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-1 rounded-full liquid-glass-indicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="relative z-10 flex flex-col items-center gap-0.5"
                  >
                    <Icon 
                      className={cn(
                        'h-4 w-4 transition-all duration-200',
                        active 
                          ? 'text-primary scale-110' 
                          : 'text-muted-foreground'
                      )} 
                    />
                    <span 
                      className={cn(
                        'text-[9px] font-medium transition-all duration-200',
                        active 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      )}
                    >
                      {tab.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      </div>
    </div>
  );
}
