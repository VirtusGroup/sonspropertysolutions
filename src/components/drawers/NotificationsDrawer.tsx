import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { Bell, ClipboardList, Gift, Info, CheckCheck, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types';

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<Notification['type'], { label: string; icon: typeof Bell; color: string }> = {
  order: { label: 'Order Updates', icon: ClipboardList, color: 'text-primary' },
  promo: { label: 'Promotions', icon: Gift, color: 'text-amber-500' },
  system: { label: 'System', icon: Info, color: 'text-muted-foreground' },
};

export function NotificationsDrawer({ open, onOpenChange }: NotificationsDrawerProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {} as Record<Notification['type'], Notification[]>);

  // Sort groups by most recent notification in each group
  const sortedGroups = Object.entries(groupedNotifications).sort(([, a], [, b]) => {
    const aLatest = Math.max(...a.map(n => new Date(n.timestamp).getTime()));
    const bLatest = Math.max(...b.map(n => new Date(n.timestamp).getTime()));
    return bLatest - aLatest;
  });

  const getIcon = (type: Notification['type']) => {
    const config = typeConfig[type];
    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.color}`} />;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {unreadCount} new
                </Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={markAllNotificationsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription>
            Stay updated on your services and orders
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No notifications yet</h3>
              <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                When you have updates about your orders or promotions, they'll appear here
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {sortedGroups.map(([type, typeNotifications]) => {
                const config = typeConfig[type as Notification['type']];
                const Icon = config.icon;
                const typeUnreadCount = typeNotifications.filter(n => !n.read).length;

                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Group Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="text-sm font-medium text-foreground">{config.label}</span>
                      {typeUnreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs h-5">
                          {typeUnreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Notifications in Group */}
                    <div className="space-y-2">
                      {typeNotifications
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-lg border transition-colors ${
                              notification.read
                                ? 'bg-background border-border'
                                : 'bg-primary/5 border-primary/20'
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-sm text-foreground">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between gap-2 mt-3">
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
                          </motion.div>
                        ))}
                    </div>
                    
                    {sortedGroups.indexOf([type, typeNotifications] as [string, Notification[]]) < sortedGroups.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
