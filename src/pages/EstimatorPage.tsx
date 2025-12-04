import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { estimatePrice } from '@/lib/estimator';
import { ChevronRight, Home, Building2 } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  roofing: 'Roof Inspections',
  gutters: 'Gutters & Drainage',
  maintenance: 'Repair & Maintenance',
  emergency: 'Emergency Services',
};

const categoryOrder = ['roofing', 'gutters', 'maintenance', 'emergency'];

export default function EstimatorPage() {
  const { services } = useStore();

  // Group services by category
  const groupedServices = categoryOrder.reduce((acc, category) => {
    acc[category] = services.filter((s) => s.category === category);
    return acc;
  }, {} as Record<string, typeof services>);

  return (
    <div className="flex flex-col min-h-screen pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 py-4"
      >
        <h1 className="text-2xl font-bold text-foreground">Price Estimator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get instant price estimates for our services
        </p>
      </motion.div>

      {/* Category Groups */}
      <div className="flex-1 px-4 space-y-6">
        {categoryOrder.map((category, categoryIndex) => {
          const categoryServices = groupedServices[category];
          if (categoryServices.length === 0) return null;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {categoryLabels[category] || category}
              </h2>

              {/* Service Cards */}
              <div className="space-y-3">
                {categoryServices.map((service, serviceIndex) => {
                  const [low, high] = estimatePrice({
                    service,
                    quantity: 1,
                    roofType: 'asphalt',
                    stories: 1,
                    addonIds: [],
                  });

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: categoryIndex * 0.1 + serviceIndex * 0.05,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={`/services/${service.slug}`}
                        className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-14 h-14 rounded-lg bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${service.heroImage})` }}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm leading-tight">
                            {service.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            {service.applicableTo === 'both' ? (
                              <>
                                <Home className="h-3 w-3" />
                                <span className="text-xs">/</span>
                                <Building2 className="h-3 w-3" />
                              </>
                            ) : service.applicableTo === 'residential' ? (
                              <>
                                <Home className="h-3 w-3" />
                                <span className="text-xs">Only</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="h-3 w-3" />
                                <span className="text-xs">Only</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <p className="text-base font-bold text-accent">
                            ${low} - ${high}
                          </p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-xs text-muted-foreground text-center pt-4 pb-2"
        >
          * Final pricing may change after on-site inspection
        </motion.p>
      </div>
    </div>
  );
}
