import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Phone, 
  Mail, 
  Building, 
  Home,
  User,
  Camera,
  X
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { OrderStatus } from '@/types';

const statusSteps: OrderStatus[] = ['received', 'scheduled', 'in_progress', 'job_complete', 'finished'];

const statusLabels: Record<OrderStatus, string> = {
  received: 'Received',
  scheduled: 'Scheduled',
  in_progress: 'Job In Progress',
  job_complete: 'Job Complete',
  finished: 'Finished',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, services, currentUser } = useStore();
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const order = orders.find((o) => o.id === id);
  const service = order ? services.find((s) => s.id === order.serviceId) : null;
  const address = order ? currentUser?.addresses.find((a) => a.id === order.addressId) : null;

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
  const hasEstimate = order.estimateLow > 0 && order.estimateHigh > 0;

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
              <p className="text-sm font-mono text-primary">#{order.jobRef}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </motion.div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${
                              isCompleted
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted bg-background text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                isCompleted ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p
                            className={`font-medium ${
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {statusLabels[step]}
                          </p>
                          {isCurrent && order.status === 'scheduled' && order.scheduledAt && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.scheduledAt), 'EEEE, MMM d @ h:mm a')}
                            </p>
                          )}
                          {step === 'received' && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                            </p>
                          )}
                          {step === 'finished' && order.completedAt && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.completedAt), 'MMM d, h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                {order.quantity && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">
                      {order.quantity} {service.unit.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {order.roofType && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground">Roof Type</span>
                    <span className="font-medium capitalize">{order.roofType}</span>
                  </div>
                )}
                {order.stories && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground">Stories</span>
                    <span className="font-medium">{order.stories}</span>
                  </div>
                )}
                {order.addonIds.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block mb-2">Add-ons</span>
                    <div className="flex flex-wrap gap-2">
                      {order.addonIds.map((addonId) => {
                        const addon = service.addons.find((a) => a.id === addonId);
                        return addon ? (
                          <Badge key={addon.id} variant="secondary">
                            {addon.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
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
                        {order.propertyType === 'commercial' ? (
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
                  <span className="font-medium">{order.contactFirstName} {order.contactLastName}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{order.contactEmail}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{order.contactPhone}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Photos */}
          {order.photos && order.photos.length > 0 && (
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
                    {order.photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setLightboxPhoto(photo.dataUrl)}
                        className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={photo.dataUrl}
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
                {order.scheduledAt ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled Date</span>
                      <span className="font-medium">
                        {format(new Date(order.scheduledAt), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    {order.preferredWindow && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Window</span>
                        <span className="font-medium">{order.preferredWindow}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Not yet scheduled</p>
                    {order.preferredWindow && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Preferred: {order.preferredWindow}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Estimate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.3 }}
          >
            <Card className="border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasEstimate ? (
                  <>
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${order.estimateLow} - ${order.estimateHigh}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      * Final pricing may change after on-site inspection
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-semibold text-foreground mb-2">
                      Custom Quote Required
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A Sons Roofing representative will contact you with pricing details
                    </p>
                  </>
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
                  <a href="tel:+18172310171">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Sons Roofing
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="mailto:hello@sonsroofs.com">
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
