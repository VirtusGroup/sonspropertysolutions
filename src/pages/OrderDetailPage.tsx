import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, MapPin, Calendar, DollarSign, FileText, Phone, Mail } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

const statusSteps = ['received', 'scheduled', 'on-site', 'completed'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, services, currentUser, advanceOrderStatus } = useStore();

  const order = orders.find((o) => o.id === id);
  const service = order ? services.find((s) => s.id === order.serviceId) : null;
  const address = order ? currentUser?.addresses.find((a) => a.id === order.addressId) : null;

  if (!order || !service || !address) {
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
      {/* Header */}
      <div className="bg-muted/50 px-4 py-6 border-b">
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
              <p className="text-sm text-muted-foreground">Order #{order.id}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Timeline */}
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
                          className={`font-medium capitalize ${
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.replace('-', ' ')}
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
                        {step === 'completed' && order.completedAt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(order.completedAt), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dev: Advance Status Button */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => advanceOrderStatus(order.id)}
                >
                  [Dev] Advance to Next Status
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
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

          {/* Service Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{address.street}</p>
              {address.unit && <p className="text-sm text-muted-foreground">{address.unit}</p>}
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} {address.zip}
              </p>
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

          {/* Preferred Window */}
          {order.preferredWindow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Preferred Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{order.preferredWindow}</p>
              </CardContent>
            </Card>
          )}

          {/* Estimate */}
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                ${order.estimateLow} - ${order.estimateHigh}
              </div>
              <p className="text-xs text-muted-foreground">
                * Final pricing may change after on-site inspection
              </p>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="tel:+18172310171">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us
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
        </div>
      </div>
    </div>
  );
}
