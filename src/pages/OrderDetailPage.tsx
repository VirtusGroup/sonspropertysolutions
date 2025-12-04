import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  Building, 
  Home,
  User,
  Camera,
  X,
  AlertTriangle,
  Clock,
  XCircle
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useOrder } from '@/hooks/useOrders';
import { useAddresses } from '@/hooks/useAddresses';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { format } from 'date-fns';
import { OrderStatus } from '@/types';

const statusSteps: OrderStatus[] = ['received', 'scheduled', 'in_progress', 'job_complete', 'finished'];

const statusLabels: Record<OrderStatus, string> = {
  received: 'Received',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  job_complete: 'Job Complete',
  finished: 'Finished',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services } = useStore();
  const { data: order, isLoading } = useOrder(id);
  const { addresses } = useAddresses();
  const { getPhotoUrl } = usePhotoUpload();
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const service = order ? services.find((s) => s.id === order.service_id) : null;
  const address = order ? addresses.find((a) => a.id === order.address_id) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order || !service) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="flex flex-col min-h-screen pb-6">
      {/* Lightbox */}
      {lightboxPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            onClick={() => setLightboxPhoto(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </motion.div>
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-muted/50 px-4 py-6 border-b"
      >
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{service.title}</h1>
              <p className="text-sm font-mono text-primary">#{order.job_ref}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </motion.div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Sync Status Alerts */}
          {order.sync_status === 'pending_photo_upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Photos are being uploaded...
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {order.sync_status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  Issue submitting your request..retrying
                  {order.sync_attempts && order.sync_attempts > 0 && (
                    <span className="ml-1 text-sm opacity-75">
                      (Retry {order.sync_attempts} of 3)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {order.sync_status === 'photo_upload_failed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  Photo upload failed. Retrying...
                  {order.sync_attempts && order.sync_attempts > 0 && (
                    <span className="ml-1 text-sm opacity-75">
                      (Retry {order.sync_attempts} of 3)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {order.sync_status === 'requires_manual_review' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Please contact support.
                  {order.last_sync_error && (
                    <span className="block mt-1 text-sm opacity-90">
                      Error: {order.last_sync_error.length > 100 
                        ? `${order.last_sync_error.substring(0, 100)}...` 
                        : order.last_sync_error}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {/* Horizontal Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-28 px-4">
                  {/* SVG curves layer */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    preserveAspectRatio="none"
                    style={{ overflow: 'visible' }}
                  >
                    {statusSteps.map((_, index) => {
                      if (index === 0) return null;
                      const isCompletedLine = index <= currentStepIndex;
                      
                      // Calculate positions (circles are at 10%, 30%, 50%, 70%, 90% horizontally)
                      const prevX = ((index - 1) * 20 + 10);
                      const currX = (index * 20 + 10);
                      const midX = (prevX + currX) / 2;
                      
                      // Center Y is at 50% of container height
                      const centerY = 50;
                      // Curve amplitude - alternates direction
                      const curveDown = index % 2 === 1;
                      const controlY = curveDown ? centerY + 20 : centerY - 20;
                      
                      return (
                        <path
                          key={`curve-${index}`}
                          d={`M ${prevX}% ${centerY}% Q ${midX}% ${controlY}% ${currX}% ${centerY}%`}
                          className={isCompletedLine ? 'stroke-primary' : 'stroke-muted'}
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Circles and labels layer */}
                  <div className="relative flex justify-between items-center h-full">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      // Alternating: index 0, 2, 4 = top; index 1, 3 = bottom
                      const labelOnTop = index % 2 === 0;

                      return (
                        <div key={step} className="relative flex items-center justify-center" style={{ width: '32px' }}>
                          {/* Label - absolutely positioned and centered */}
                          <span
                            className={`absolute left-1/2 -translate-x-1/2 text-xs text-center whitespace-nowrap ${
                              labelOnTop ? 'bottom-full mb-2' : 'top-full mt-2'
                            } ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                          >
                            {statusLabels[step]}
                          </span>

                          {/* Circle */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background ${
                              isCompleted
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
                          >
                            <span className="text-xs font-medium">{index + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-right">{service.title}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Property Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                {address ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{address.label}</p>
                      <Badge variant="outline" className="text-xs">
                        {order.property_type === 'commercial' ? (
                          <><Building className="h-3 w-3 mr-1" />Commercial</>
                        ) : (
                          <><Home className="h-3 w-3 mr-1" />Residential</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{address.street}</p>
                    {address.unit && <p className="text-sm text-muted-foreground">{address.unit}</p>}
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Address not found</p>
                )}
                {order.notes && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-sm">
                      <span className="text-muted-foreground">Notes: </span>
                      {order.notes}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{order.contact_first_name} {order.contact_last_name}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{order.contact_email}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{order.contact_phone}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Photos */}
          {order.order_photos && order.order_photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {order.order_photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setLightboxPhoto(getPhotoUrl(photo.storage_path))}
                        className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={getPhotoUrl(photo.storage_path)}
                          alt="Order photo"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Scheduling Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.scheduled_at ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled Date</span>
                      <span className="font-medium">
                        {format(new Date(order.scheduled_at), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    {order.preferred_window && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Window</span>
                        <span className="font-medium">{order.preferred_window}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Not yet scheduled</p>
                    {order.preferred_window && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Preferred: {order.preferred_window}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="tel:+18175551234">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="mailto:support@sonsroofs.com">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}