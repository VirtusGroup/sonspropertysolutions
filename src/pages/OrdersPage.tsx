import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { ClipboardList, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { orders, currentUser, services } = useStore();

  const userOrders = orders
    .filter((o) => o.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (userOrders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Book your first service in minutes. Professional service, trusted quality."
          actionLabel="Book Service"
          onAction={() => (window.location.href = '/book')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-muted/50 px-4 py-8 border-b"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your service requests and appointments
          </p>
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {userOrders.map((order, index) => {
            const service = services.find((s) => s.id === order.serviceId);
            const address = currentUser?.addresses.find((a) => a.id === order.addressId);

            if (!service || !address) return null;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link to={`/orders/${order.id}`}>
                  <Card className="hover:shadow-strong transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{service.title}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{address.street}, {address.city}</span>
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Requested</span>
                        <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      {order.scheduledAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Scheduled</span>
                          <span className="font-medium">
                            {format(new Date(order.scheduledAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">Estimate</span>
                        <span className="font-semibold text-primary">
                          ${order.estimateLow} - ${order.estimateHigh}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
