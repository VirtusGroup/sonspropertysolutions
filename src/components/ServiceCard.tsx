import { Service } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: Service;
  index?: number;
}

export function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const priceDisplay =
    service.unit === 'fixed'
      ? `$${service.basePrice}`
      : `$${service.basePrice}/${service.unit.replace('_', ' ')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Link to={`/services/${service.slug}`}>
        <Card className="overflow-hidden hover:shadow-strong transition-shadow cursor-pointer h-full group">
          <div className="aspect-video bg-muted relative overflow-hidden">
            <motion.img
              src={service.heroImage}
              alt={service.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
            >
              <Badge className="absolute top-2 right-2 bg-card/90 backdrop-blur">
                {service.category}
              </Badge>
            </motion.div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {service.title}
            </h3>
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
    </motion.div>
  );
}
