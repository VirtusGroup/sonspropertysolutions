import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Home, Building2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { estimatePrice } from '@/lib/estimator';
import { ServiceCategory } from '@/types';

const categoryLabels: Record<ServiceCategory, string> = {
  roofing: 'Roof Inspections',
  gutters: 'Gutters & Drainage',
  maintenance: 'Repair & Maintenance',
  storm: 'Emergency Services',
};

const applicabilityConfig = {
  residential: { label: 'Residential Only', icon: Home, variant: 'secondary' as const },
  commercial: { label: 'Commercial Only', icon: Building2, variant: 'secondary' as const },
  both: { label: 'Residential & Commercial', icon: null, variant: 'outline' as const },
};

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { services } = useStore();
  
  const service = services.find((s) => s.slug === slug);

  const [quantity, setQuantity] = useState<number>(1);
  const [roofType, setRoofType] = useState('asphalt');
  const [stories, setStories] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Service Not Found</CardTitle>
            <CardDescription>The requested service could not be found</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/services">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [estimateLow, estimateHigh] = estimatePrice({
    service,
    quantity,
    roofType,
    stories,
    addonIds: selectedAddons,
  });

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleBookNow = () => {
    navigate('/book', {
      state: {
        serviceId: service.id,
        quantity,
        roofType,
        stories,
        addonIds: selectedAddons,
        estimateLow,
        estimateHigh,
      },
    });
  };

  const priceUnit = service.unit === 'fixed' ? '' : ` / ${service.unit.replace('_', ' ')}`;
  const applicability = applicabilityConfig[service.applicableTo];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Image */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-video bg-muted"
      >
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          src={service.heroImage}
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 left-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 flex flex-col gap-1 items-end"
        >
          <Badge className="bg-card/90 backdrop-blur">
            {categoryLabels[service.category]}
          </Badge>
          <Badge variant={applicability.variant} className="bg-card/90 backdrop-blur">
            {applicability.icon && <applicability.icon className="h-3 w-3 mr-1" />}
            {applicability.label}
          </Badge>
        </motion.div>
      </motion.div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{service.durationMin} min</span>
              </div>
              <div className="font-semibold text-primary">
                ${service.basePrice}{priceUnit}
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Inclusions & Exclusions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.inclusions.map((item, idx) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                      className="text-sm flex items-start gap-2"
                    >
                      <span className="text-success">•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  Not Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.exclusions.map((item, idx) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                      className="text-sm flex items-start gap-2"
                    >
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Estimator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Get an Estimate</CardTitle>
                <CardDescription>
                  Adjust the details below for a customized price estimate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.unit !== 'fixed' && (
                  <div className="space-y-2">
                    <Label>
                      Quantity ({service.unit.replace('_', ' ')})
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                )}

                {service.category === 'roofing' && (
                  <>
                    <div className="space-y-2">
                      <Label>Roof Type</Label>
                      <Select value={roofType} onValueChange={setRoofType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="tile">Tile</SelectItem>
                          <SelectItem value="slate">Slate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Stories</Label>
                      <Select
                        value={stories.toString()}
                        onValueChange={(val) => setStories(Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Story</SelectItem>
                          <SelectItem value="2">2 Stories</SelectItem>
                          <SelectItem value="3">3 Stories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {service.addons.length > 0 && (
                  <div className="space-y-3">
                    <Label>Add-ons</Label>
                    {service.addons.map((addon) => (
                      <div key={addon.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={addon.id}
                          checked={selectedAddons.includes(addon.id)}
                          onCheckedChange={() => handleToggleAddon(addon.id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={addon.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {addon.title} (+${addon.price})
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {addon.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Estimate Display */}
                <div className="bg-accent/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Estimated Price Range</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ${estimateLow} - ${estimateHigh}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Final pricing may change after on-site inspection
                  </p>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleBookNow} size="lg" className="w-full">
                    Book This Service
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
