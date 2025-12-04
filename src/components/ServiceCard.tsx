import { Service, ServiceCategory } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: Service;
  index?: number;
}

const categoryLabels: Record<ServiceCategory, string> = {
  roofing: 'Roof Inspections',
  gutters: 'Gutters & Drainage',
  maintenance: 'Repair & Maintenance',
  storm: 'Emergency Services',
};

export function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/services/${service.slug}`}>
        <Card className="overflow-hidden transition-shadow cursor-pointer h-full">
          <div className="aspect-video bg-muted relative overflow-hidden">
            <img
              src={service.heroImage}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
              className="absolute top-2 right-2 flex flex-col gap-1 items-end"
            >
              <Badge className="bg-accent text-primary backdrop-blur text-xs">
                {categoryLabels[service.category]}
              </Badge>
              <Badge variant="outline" className="bg-card/90 backdrop-blur text-xs flex items-center gap-1">
                {service.applicableTo === 'both' ? (
                  <>
                    <Home className="h-3 w-3" />
                    <span>/</span>
                    <Building2 className="h-3 w-3" />
                  </>
                ) : service.applicableTo === 'residential' ? (
                  <>
                    <Home className="h-3 w-3" />
                    <span>Only</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-3 w-3" />
                    <span>Only</span>
                  </>
                )}
              </Badge>
            </motion.div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
