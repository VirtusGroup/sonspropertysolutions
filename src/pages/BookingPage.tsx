import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyType } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Camera,
  FileText,
  Wrench,
  Home,
  Plus,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingState {
  serviceId: string;
  quantity: number;
  roofType: string;
  stories: number;
  addonIds: string[];
  estimateLow: number;
  estimateHigh: number;
}

const STEPS = [
  { id: 1, title: 'Service', icon: Wrench },
  { id: 2, title: 'Address', icon: MapPin },
  { id: 3, title: 'Details', icon: Camera },
  { id: 4, title: 'Schedule', icon: Calendar },
  { id: 5, title: 'Review', icon: FileText },
];

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM' },
  { id: 'evening', label: 'Evening', time: '4:00 PM - 7:00 PM' },
];

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, services, addOrder, addAddress, getNextJobRef } = useStore();
  const bookingState = location.state as BookingState | null;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('morning');
  const [notes, setNotes] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  const service = bookingState ? services.find(s => s.id === bookingState.serviceId) : null;

  // Check auth on mount
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please sign in to book a service');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!bookingState || !service) {
      navigate('/services');
    }
  }, [bookingState, service, navigate]);

  useEffect(() => {
    if (currentUser?.addresses?.length && !selectedAddress) {
      const primary = currentUser.addresses.find(a => a.isDefault);
      if (primary) {
        setSelectedAddress(primary.id);
        setPropertyType(primary.propertyType);
      }
    }
  }, [currentUser, selectedAddress]);

  if (!bookingState || !service || !currentUser) {
    return null;
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return selectedAddress || (useNewAddress && newAddress.street && newAddress.city && newAddress.zip);
      case 3: return true;
      case 4: return preferredDate && timeWindow;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && useNewAddress && saveNewAddress && newAddress.street && newAddress.city && newAddress.zip) {
      const newAddressId = `addr-${Date.now()}`;
      addAddress({
        id: newAddressId,
        label: 'Home',
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state || 'TX',
        zip: newAddress.zip,
        propertyType: propertyType,
        isDefault: !currentUser?.addresses?.length,
      });
      setSelectedAddress(newAddressId);
      setUseNewAddress(false);
    }
    
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = () => {
    const addressId = useNewAddress ? 'new-address' : selectedAddress;
    const orderId = `order-${Date.now()}`;
    const jobRef = getNextJobRef();

    addOrder({
      id: orderId,
      jobRef: jobRef,
      serviceId: bookingState.serviceId,
      userId: currentUser.id,
      status: 'received',
      scheduledAt: preferredDate,
      preferredWindow: `${TIME_WINDOWS.find(w => w.id === timeWindow)?.label} (${TIME_WINDOWS.find(w => w.id === timeWindow)?.time})`,
      addressId,
      propertyType: propertyType,
      contactFirstName: currentUser.firstName,
      contactLastName: currentUser.lastName,
      contactEmail: currentUser.email,
      contactPhone: currentUser.phone,
      estimateLow: bookingState.estimateLow,
      estimateHigh: bookingState.estimateHigh,
      notes,
      addonIds: bookingState.addonIds,
      photos: [],
      createdAt: new Date().toISOString(),
      quantity: bookingState.quantity,
      roofType: bookingState.roofType,
      stories: bookingState.stories,
    });

    navigate(`/orders/${orderId}`);
    toast.success(`Your request has been received! Job Reference: #${jobRef}`);
  };

  const getAddressDisplay = (addressId: string) => {
    const addr = currentUser?.addresses?.find(a => a.id === addressId);
    if (!addr) return '';
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
  };

  const handleAddressSelect = (addrId: string) => {
    const addr = currentUser?.addresses?.find(a => a.id === addrId);
    if (addr) {
      setSelectedAddress(addrId);
      setPropertyType(addr.propertyType);
      setUseNewAddress(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={handleBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Book Service</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between px-4 pb-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            return (
              <div key={step.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isComplete
                      ? 'bg-primary text-primary-foreground'
                      : isActive
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Confirm Service */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">{service.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">{bookingState.quantity} {service.unit}</span>
                    </div>
                    {bookingState.roofType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roof Type</span>
                        <span className="font-medium capitalize">{bookingState.roofType}</span>
                      </div>
                    )}
                    {bookingState.stories > 1 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stories</span>
                        <span className="font-medium">{bookingState.stories}</span>
                      </div>
                    )}
                    {bookingState.addonIds.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-muted-foreground text-sm">Add-ons:</span>
                        <ul className="mt-1 space-y-1">
                          {bookingState.addonIds.map(addonId => {
                            const addon = service.addons.find(a => a.id === addonId);
                            return addon ? (
                              <li key={addonId} className="text-sm flex justify-between">
                                <span>{addon.title}</span>
                                <span className="text-muted-foreground">+${addon.price}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="py-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
                      <p className="text-2xl font-bold text-primary">
                        ${bookingState.estimateLow.toLocaleString()} - ${bookingState.estimateHigh.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Final price after inspection</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Select Address & Property Type */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Property Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={propertyType} onValueChange={(val) => setPropertyType(val as PropertyType)}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2 p-3 rounded-lg border border-border flex-1">
                          <RadioGroupItem value="residential" id="prop-residential" />
                          <Label htmlFor="prop-residential" className="flex items-center gap-2 cursor-pointer">
                            <Home className="h-4 w-4" />
                            Residential
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border border-border flex-1">
                          <RadioGroupItem value="commercial" id="prop-commercial" />
                          <Label htmlFor="prop-commercial" className="flex items-center gap-2 cursor-pointer">
                            <Building className="h-4 w-4" />
                            Commercial
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Service Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentUser?.addresses?.length ? (
                      <RadioGroup value={useNewAddress ? 'new' : selectedAddress} onValueChange={(val) => {
                        if (val === 'new') {
                          setUseNewAddress(true);
                        } else {
                          handleAddressSelect(val);
                        }
                      }}>
                        {currentUser.addresses.map(addr => (
                          <div key={addr.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border mb-2">
                            <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                            <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                {addr.propertyType === 'commercial' ? (
                                  <Building className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <Home className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="font-medium">{addr.label || 'Home'}</span>
                                {addr.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {addr.street}, {addr.city}, {addr.state} {addr.zip}
                              </p>
                            </Label>
                          </div>
                        ))}
                        <div className="flex items-start space-x-3 p-3 rounded-lg border border-dashed border-border">
                          <RadioGroupItem value="new" id="new-address" className="mt-1" />
                          <Label htmlFor="new-address" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Add New Address</span>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <p className="text-muted-foreground text-sm mb-3">No saved addresses. Add one below:</p>
                    )}

                    {(useNewAddress || !currentUser?.addresses?.length) && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="123 Main St"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="Fort Worth"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              placeholder="TX"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={newAddress.zip}
                            onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                            placeholder="76109"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id="saveAddress"
                            checked={saveNewAddress}
                            onCheckedChange={(checked) => setSaveNewAddress(checked as boolean)}
                          />
                          <Label htmlFor="saveAddress" className="text-sm text-muted-foreground">
                            Save this address for future bookings
                          </Label>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Details (Photos & Notes) */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Photos (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Photo upload coming soon
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        For now, describe any issues in the notes below
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Special Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe what's going on and where the issue is (e.g., 'Leak in kitchen after last storm, ceiling discoloration about 2×2 ft'). Include roof type, material, & how many stories. Also, include gate code, parking instructions, etc."
                      rows={5}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Preferred Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Time Window</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={timeWindow} onValueChange={setTimeWindow}>
                      {TIME_WINDOWS.map(window => (
                        <div key={window.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border mb-2">
                          <RadioGroupItem value={window.id} id={window.id} />
                          <Label htmlFor={window.id} className="flex-1 cursor-pointer">
                            <span className="font-medium">{window.label}</span>
                            <p className="text-sm text-muted-foreground">{window.time}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="flex items-center space-x-2 px-1">
                  <Checkbox
                    id="flexible"
                    checked={isFlexible}
                    onCheckedChange={(checked) => setIsFlexible(checked as boolean)}
                  />
                  <Label htmlFor="flexible" className="text-sm text-muted-foreground">
                    I'm flexible with my schedule for earlier availability
                  </Label>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium">{service.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type</span>
                        <span className="font-medium capitalize">{propertyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">{bookingState.quantity} {service.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium text-right max-w-[200px]">
                          {useNewAddress 
                            ? `${newAddress.street}, ${newAddress.city}` 
                            : getAddressDisplay(selectedAddress).split(',').slice(0, 2).join(',')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">
                          {new Date(preferredDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">
                          {TIME_WINDOWS.find(w => w.id === timeWindow)?.label}
                        </span>
                      </div>
                    </div>

                    {notes && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                        <p className="text-sm">{notes}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Estimated Total</span>
                        <span className="text-lg font-bold text-primary">
                          ${bookingState.estimateLow.toLocaleString()} - ${bookingState.estimateHigh.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Final pricing will be confirmed after on-site inspection
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-center px-4">
                  By confirming, you agree to our terms of service. A Sons Roofing representative will contact you within 2 hours for emergency requests or next business day for standard services.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        {currentStep < 5 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full"
            size="lg"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="w-full"
            size="lg"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
