import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Bell, ClipboardList, Gift, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDrawer({ open, onOpenChange }: NotificationsDrawerProps) {
  const { notifications, markNotificationRead } = useStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ClipboardList className="h-5 w-5 text-primary" />;
      case 'promo':
        return <Gift className="h-5 w-5 text-accent" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </SheetTitle>
          <SheetDescription>
            Stay updated on your services and orders
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? 'bg-background border-border'
                    : 'bg-accent/5 border-accent/20'
                }`}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => markNotificationRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        {notification.orderId && (
                          <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                            <Link
                              to={`/orders/${notification.orderId}`}
                              onClick={() => onOpenChange(false)}
                            >
                              View Order
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
