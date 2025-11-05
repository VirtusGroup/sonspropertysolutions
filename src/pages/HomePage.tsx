import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Clock, MapPin, Phone, MessageSquare, Smartphone } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ServiceCard } from '@/components/ServiceCard';

export default function HomePage() {
  const { services, promos } = useStore();
  const activePromos = promos.filter((p) => p.active);
  const popularServices = services.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold">
            Quality Roofing & Property Services
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Trusted by Dallas-Fort Worth homeowners for over a decade. Professional service, family values.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link to="/book">Book Service</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/services">View Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Active Promos */}
      {activePromos.length > 0 && (
        <section className="px-4 py-8 bg-accent/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Current Promotions</h2>
            <div className="grid gap-3">
              {activePromos.map((promo) => (
                <Card key={promo.id} className="border-accent/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{promo.title}</CardTitle>
                        <CardDescription>{promo.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{promo.code}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Services */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Popular Services</h2>
            <Button asChild variant="ghost">
              <Link to="/services">See All</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 py-12 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Sons Property Solutions?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Fully Insured</CardTitle>
                <CardDescription>
                  Licensed and insured for your peace of mind
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">Quality Guaranteed</CardTitle>
                <CardDescription>
                  All work backed by our satisfaction guarantee
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">On-Time Service</CardTitle>
                <CardDescription>
                  We respect your time and schedule
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Serving the DFW Area</h2>
          <p className="text-muted-foreground mb-4">
            Dallas • Fort Worth • Arlington • Irving • Plano • And surrounding areas
          </p>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Service Area Map</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-12 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Get In Touch</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2"
            >
              <a href="tel:+18172310171">
                <Phone className="h-6 w-6" />
                <span>Call Us</span>
                <span className="text-xs text-muted-foreground">(817) 231-0171</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2"
            >
              <a href="sms:+18172310171">
                <MessageSquare className="h-6 w-6" />
                <span>Text Us</span>
                <span className="text-xs text-muted-foreground">Quick Response</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2"
            >
              <Link to="/install">
                <Smartphone className="h-6 w-6" />
                <span>Install App</span>
                <span className="text-xs text-muted-foreground">Easy Access</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
