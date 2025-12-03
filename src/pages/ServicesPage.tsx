import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceCategory } from '@/types';

const categories: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Services' },
  { value: 'roofing', label: 'Roof Inspections' },
  { value: 'gutters', label: 'Gutters & Drainage' },
  { value: 'maintenance', label: 'Repair & Maintenance' },
  { value: 'storm', label: 'Emergency Services' },
];

export default function ServicesPage() {
  const { services } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');

  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'duration') {
      filtered = [...filtered].sort((a, b) => a.durationMin - b.durationMin);
    }

    return filtered;
  }, [services, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-muted/50 px-4 py-8 border-b"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Our Services</h1>
          <p className="text-muted-foreground">
            Professional property services for your home
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="sticky top-14 z-40 bg-background border-b px-4 py-4"
      >
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category & Sort */}
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Sort by Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Service Grid */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {filteredServices.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No services found</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
