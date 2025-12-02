import { motion } from 'framer-motion';
import { Phone, Mail, MessageSquare, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const contactMethods = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '(817) 231-0171',
    href: 'tel:+18172310171',
    description: 'Speak directly with our team',
  },
  {
    icon: MessageSquare,
    label: 'Text Us',
    value: '(817) 231-0171',
    href: 'sms:+18172310171',
    description: 'Quick questions? Send a text',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'support@sonsroofs.com',
    href: 'mailto:support@sonsroofs.com',
    description: 'For detailed inquiries',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 py-4 border-b border-border bg-card"
      >
        <h1 className="text-xl font-bold text-foreground">Contact Us</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          We're here to help
        </p>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 p-4 space-y-4"
      >
        {/* Contact Methods */}
        {contactMethods.map((method, index) => (
          <motion.div key={method.label} variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <a
                  href={method.href}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{method.label}</h3>
                    <p className="text-sm text-primary font-medium">{method.value}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Business Hours */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-primary" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monday - Friday</span>
                <span className="font-medium text-foreground">7:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saturday</span>
                <span className="font-medium text-foreground">8:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sunday</span>
                <span className="font-medium text-foreground">Closed</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
                Emergency services available 24/7 for storm damage
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Area */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5 text-primary" />
                Service Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Proudly serving the DFW Metroplex including:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['Fort Worth', 'Arlington', 'Mansfield', 'Burleson', 'Crowley', 'Kennedale', 'Grand Prairie', 'Benbrook'].map((city) => (
                  <span key={city} className="text-foreground">• {city}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
    </div>
  );
}
