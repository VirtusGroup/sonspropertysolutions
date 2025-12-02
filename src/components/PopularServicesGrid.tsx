import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import roofRepairImg from '@/assets/roof-repair.jpg';
import roofInspectionImg from '@/assets/roof-inspection.jpg';
import gutterCleaningImg from '@/assets/gutter-cleaning.jpg';
import emergencyTarpImg from '@/assets/emergency-tarp.jpg';

const popularServices = [
  { label: 'Small Roof Repair', slug: 'roof-repair-small', image: roofRepairImg },
  { label: 'Roof Inspection', slug: 'roof-inspection', image: roofInspectionImg },
  { label: 'Gutter Cleaning', slug: 'gutter-cleaning', image: gutterCleaningImg },
  { label: 'Emergency Tarp', slug: 'emergency-tarp', image: emergencyTarpImg },
];

export function PopularServicesGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {popularServices.map((service, index) => (
        <Link key={service.slug} to={`/services/${service.slug}`}>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.5 + index * 0.08,
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl overflow-hidden aspect-[16/10]"
          >
            {/* Background Image */}
            <img
              src={service.image}
              alt={service.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Teal Overlay */}
            <div className="absolute inset-0 bg-[#0d9488]/60" />
            {/* Text Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-base drop-shadow-lg text-center px-2">
                {service.label}
              </span>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
