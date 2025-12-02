import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoBannerProps {
  title: string;
  description: string;
  code: string;
  ctaText?: string;
  ctaLink?: string;
  onDismiss?: () => void;
}

export function PromoBanner({
  title,
  description,
  code,
  ctaText = 'Book Now',
  ctaLink = '/book',
  onDismiss,
}: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-accent to-accent/80 border-accent">
            <div className="absolute top-2 right-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-accent-foreground/70 hover:text-accent-foreground hover:bg-accent-foreground/10"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            
            <div className="p-6 pr-12">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </motion.div>
                <Badge variant="secondary" className="bg-accent-foreground/20 text-accent-foreground border-none">
                  {code}
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold text-accent-foreground mb-1">
                {title}
              </h3>
              
              <p className="text-sm text-accent-foreground/90 mb-4">
                {description}
              </p>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  asChild 
                  variant="secondary"
                  className="bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                >
                  <Link to={ctaLink}>{ctaText}</Link>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
