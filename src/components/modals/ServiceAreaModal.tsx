import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceAreaModal({ open, onOpenChange }: ServiceAreaModalProps) {
  const cities = [
    'Dallas',
    'Fort Worth',
    'Arlington',
    'Irving',
    'Plano',
    'Garland',
    'Grand Prairie',
    'McKinney',
    'Frisco',
    'Carrollton',
    'Denton',
    'Richardson',
    'Lewisville',
    'Flower Mound',
    'Coppell',
    'Grapevine',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Service Area
          </DialogTitle>
          <DialogDescription>
            Proudly serving the Dallas-Fort Worth metroplex
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 border border-border">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">DFW Service Area Map</p>
            </div>
          </div>

          <h3 className="font-semibold text-sm mb-3 text-foreground">Cities We Serve:</h3>
          <div className="grid grid-cols-2 gap-2">
            {cities.map((city) => (
              <div key={city} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{city}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            Don't see your city? Contact us to check if we can serve your area.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild className="flex-1">
            <a href="tel:+18172310171">Call to Verify</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
