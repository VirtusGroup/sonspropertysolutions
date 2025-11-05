import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Phone, Mail, MessageSquare, Shield, Clock } from 'lucide-react';

const faqs = [
  {
    question: 'How quickly can you respond to emergency requests?',
    answer: 'For emergency services like storm tarps, we offer 24/7 response and aim to arrive within 2-4 hours. Regular service requests are typically scheduled within 3-5 business days.',
  },
  {
    question: 'Do you offer warranties on your work?',
    answer: 'Yes! All our services include warranties. Specific warranty periods vary by service type and are detailed in each service description.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We proudly serve the entire Dallas-Fort Worth metroplex and surrounding areas, including Dallas, Fort Worth, Arlington, Irving, Plano, and nearby communities.',
  },
  {
    question: 'Are you licensed and insured?',
    answer: 'Absolutely. Sons Property Solutions is fully licensed and insured. We carry comprehensive liability insurance and workers compensation coverage.',
  },
  {
    question: 'How do you calculate estimates?',
    answer: 'Our estimates are based on the specific service, property size, materials needed, and labor required. All estimates include a range to account for unexpected factors discovered during inspection.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, checks, and cash. Payment is typically due upon completion of service unless other arrangements have been made.',
  },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-muted/50 px-4 py-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Support & Help</h1>
          <p className="text-muted-foreground">
            We're here to help with any questions or concerns
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Contact Options */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2"
            >
              <a href="tel:+18172310171">
                <Phone className="h-6 w-6" />
                <span className="font-semibold">Call Us</span>
                <span className="text-xs text-muted-foreground">(817) 231-0171</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2"
            >
              <a href="mailto:hello@sonsroofs.com">
                <Mail className="h-6 w-6" />
                <span className="font-semibold">Email Us</span>
                <span className="text-xs text-muted-foreground">hello@sonsroofs.com</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2"
            >
              <a href="sms:+18172310171">
                <MessageSquare className="h-6 w-6" />
                <span className="font-semibold">Text Us</span>
                <span className="text-xs text-muted-foreground">Quick Response</span>
              </a>
            </Button>
          </div>

          {/* Hours */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Business Hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Monday - Saturday</span>
                  <span className="font-medium">8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sunday</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span>Emergency Service</span>
                  <span className="font-medium text-accent">24/7 Available</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about our services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Warranty Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Our Guarantee</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                We stand behind our work with comprehensive warranties on all services. If you're not
                completely satisfied, we'll make it right.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>100% satisfaction guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Licensed and insured professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Quality materials and workmanship</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Transparent pricing with no hidden fees</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
