import { Service } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const priceDisplay =
    service.unit === 'fixed'
      ? `$${service.basePrice}`
      : `$${service.basePrice}/${service.unit.replace('_', ' ')}`;

  return (
    <Link to={`/services/${service.slug}`}>
      <Card className="overflow-hidden hover:shadow-medium transition-shadow cursor-pointer h-full">
        <div className="aspect-video bg-muted relative overflow-hidden">
          <img
            src={service.heroImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-card/90 backdrop-blur">
            {service.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{service.durationMin} min</span>
          </div>
          <div className="font-semibold text-primary">{priceDisplay}</div>
        </CardFooter>
      </Card>
    </Link>
  );
}
