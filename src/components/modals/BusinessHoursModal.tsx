import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessHoursModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessHoursModal({ open, onOpenChange }: BusinessHoursModalProps) {
  const hours = [
    { day: 'Monday', time: '7:00 AM - 6:00 PM' },
    { day: 'Tuesday', time: '7:00 AM - 6:00 PM' },
    { day: 'Wednesday', time: '7:00 AM - 6:00 PM' },
    { day: 'Thursday', time: '7:00 AM - 6:00 PM' },
    { day: 'Friday', time: '7:00 AM - 6:00 PM' },
    { day: 'Saturday', time: '8:00 AM - 4:00 PM' },
    { day: 'Sunday', time: 'Emergency Only' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Business Hours
          </DialogTitle>
          <DialogDescription>
            Our regular service hours and availability
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {hours.map((item) => (
            <div key={item.day} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="font-medium text-foreground">{item.day}</span>
              <span className="text-sm text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>

        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                24/7 Emergency Service Available
              </p>
              <p className="text-xs text-muted-foreground">
                Storm damage and urgent repairs available anytime
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild className="flex-1">
            <a href="tel:+18172310171">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
