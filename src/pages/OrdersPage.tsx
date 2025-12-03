import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { ClipboardList, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAddresses } from '@/hooks/useAddresses';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();
  const { addresses } = useAddresses();
  const { services } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const activeOrders = orders.filter(
    (o) => !['finished', 'cancelled'].includes(o.status)
  );
  const pastOrders = orders.filter(
    (o) => ['finished', 'cancelled'].includes(o.status)
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const renderEmptyState = () => {
    if (activeTab === 'active') {
      return (
        <EmptyState
          icon={ClipboardList}
          title="No active orders"
          description="You don't have any active service requests. Book a service to get started."
          actionLabel="Book Service"
          onAction={() => (window.location.href = '/services')}
        />
      );
    }
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No past orders"
        description="Your completed and cancelled orders will appear here."
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        className="bg-muted/50 px-4 py-4 border-b"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your service requests and appointments
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="sticky top-14 z-10 bg-background border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'past')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Active
                {activeOrders.length > 0 && (
                  <span className="ml-1 bg-primary/10 text-primary text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {activeOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Past
                {pastOrders.length > 0 && (
                  <span className="ml-1 bg-muted-foreground/10 text-muted-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {pastOrders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {displayedOrders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              {renderEmptyState()}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order, index) => {
                const service = services.find((s) => s.id === order.service_id);
                const address = addresses.find((a) => a.id === order.address_id);

                if (!service) return null;

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
                  >
                    <Link to={`/orders/${order.id}`}>
                      <Card className="transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-lg">{service.title}</CardTitle>
                              </div>
                              <p className="text-sm font-mono text-primary">#{order.job_ref}</p>
                              {address && (
                                <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{address.street}, {address.city}</span>
                                </div>
                              )}
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Requested</span>
                            <span>{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          {order.scheduled_at && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Scheduled</span>
                              <span className="font-medium">
                                {format(new Date(order.scheduled_at), 'MMM d, h:mm a')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground">Estimate</span>
                            {order.estimate_low && order.estimate_high ? (
                              <span className="font-semibold text-primary">
                                ${order.estimate_low} - ${order.estimate_high}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">Custom quote</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
