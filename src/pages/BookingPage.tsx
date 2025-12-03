import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PropertyType, Photo } from '@/types';
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
  Phone,
  X,
  Upload,
  CheckCircle2,
  Pencil,
  MessageCircle,
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
  { id: 2, title: 'Property', icon: Building },
  { id: 3, title: 'Address', icon: MapPin },
  { id: 4, title: 'Contact', icon: Phone },
  { id: 5, title: 'Details', icon: Camera },
  { id: 6, title: 'Schedule', icon: Calendar },
  { id: 7, title: 'Review', icon: FileText },
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  
  // Property Type (Step 2)
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  
  // Address (Step 3)
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', zip: '' });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  
  // Contact Info (Step 4)
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Details (Step 5)
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState('');
  
  // Schedule (Step 6)
  const [preferredDate, setPreferredDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('morning');
  const [isFlexible, setIsFlexible] = useState(false);
  
  // Confirmation state
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedJobRef, setConfirmedJobRef] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

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

  // Pre-fill contact info from currentUser
  useEffect(() => {
    if (currentUser) {
      setContactFirstName(currentUser.firstName);
      setContactLastName(currentUser.lastName);
      setContactEmail(currentUser.email);
      setContactPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Set default address
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
      case 2: return !!propertyType;
      case 3: return selectedAddress || (useNewAddress && newAddress.street && newAddress.city && newAddress.zip);
      case 4: return contactFirstName && contactLastName && contactEmail && contactPhone;
      case 5: return true;
      case 6: return preferredDate && timeWindow;
      case 7: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 3 && useNewAddress && saveNewAddress && newAddress.street && newAddress.city && newAddress.zip) {
      const newAddressId = `addr-${Date.now()}`;
      addAddress({
        id: newAddressId,
        label: newAddress.label || 'Home',
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
    
    if (currentStep < 7 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (isConfirmed) {
      navigate('/orders');
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const handleGoToStep = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos(prev => [...prev, { 
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          dataUrl: reader.result as string 
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
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
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      estimateLow: bookingState.estimateLow,
      estimateHigh: bookingState.estimateHigh,
      notes,
      addonIds: bookingState.addonIds,
      photos,
      createdAt: new Date().toISOString(),
      quantity: bookingState.quantity,
      roofType: bookingState.roofType,
      stories: bookingState.stories,
    });

    setConfirmedJobRef(jobRef);
    setConfirmedOrderId(orderId);
    setIsConfirmed(true);
  };

  const getAddressDisplay = (addressId: string) => {
    const addr = currentUser?.addresses?.find(a => a.id === addressId);
    if (!addr) return '';
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
  };

  const getAddressLabel = (addressId: string) => {
    const addr = currentUser?.addresses?.find(a => a.id === addressId);
    return addr?.label || 'Home';
  };

  const handleAddressSelect = (addrId: string) => {
    const addr = currentUser?.addresses?.find(a => a.id === addrId);
    if (addr) {
      setSelectedAddress(addrId);
      setUseNewAddress(false);
    }
  };

  const hasEstimate = bookingState.estimateLow > 0 && bookingState.estimateHigh > 0;

  // Confirmation Screen
  if (isConfirmed) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            Your Request Has Been Received!
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <p className="text-muted-foreground mb-3">Job Reference</p>
            <Badge variant="secondary" className="text-xl px-4 py-2 font-mono">
              #{confirmedJobRef}
            </Badge>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-lg p-4 mb-8 max-w-sm"
          >
            <div className="flex items-start gap-3 text-left">
              <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                A Sons Roofing representative will contact you within <span className="font-medium text-foreground">2 hours</span> for emergency requests or <span className="font-medium text-foreground">next business day</span> for standard services.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 w-full max-w-sm"
          >
            <Button asChild className="w-full" size="lg">
              <Link to={`/orders/${confirmedOrderId}`}>
                View in My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/">
                Back to Home
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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

        {/* Progress Steps - scrollable */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center gap-1 min-w-[48px]"
                onClick={() => handleGoToStep(step.id)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isComplete
                      ? 'bg-primary text-primary-foreground cursor-pointer'
                      : isActive
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs whitespace-nowrap ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
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
                      {hasEstimate ? (
                        <>
                          <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
                          <p className="text-2xl font-bold text-primary">
                            ${bookingState.estimateLow.toLocaleString()} - ${bookingState.estimateHigh.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Final price after inspection</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-1">Pricing</p>
                          <p className="text-lg font-semibold text-foreground">
                            Custom Quote Required
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            A Sons Roofing representative will contact you with pricing
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Property Type */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">What type of property is this?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={propertyType} onValueChange={(val) => setPropertyType(val as PropertyType)}>
                      <div className="space-y-3">
                        <div 
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            propertyType === 'residential' ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setPropertyType('residential')}
                        >
                          <RadioGroupItem value="residential" id="prop-residential" />
                          <Label htmlFor="prop-residential" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Home className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium block">Residential</span>
                              <span className="text-sm text-muted-foreground">Single-family home, townhouse, condo</span>
                            </div>
                          </Label>
                        </div>
                        <div 
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            propertyType === 'commercial' ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setPropertyType('commercial')}
                        >
                          <RadioGroupItem value="commercial" id="prop-commercial" />
                          <Label htmlFor="prop-commercial" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium block">Commercial</span>
                              <span className="text-sm text-muted-foreground">Office, retail, warehouse, multi-family</span>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Select Address */}
            {currentStep === 3 && (
              <div className="space-y-4">
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
                          <Label htmlFor="label">Property Nickname</Label>
                          <Input
                            id="label"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            placeholder="Home, Office, etc."
                          />
                        </div>
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

            {/* Step 4: Contact Info */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Contact Information</CardTitle>
                    <p className="text-sm text-muted-foreground">Who should we contact about this job?</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="contactFirstName">First Name</Label>
                        <Input
                          id="contactFirstName"
                          value={contactFirstName}
                          onChange={(e) => setContactFirstName(e.target.value)}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactLastName">Last Name</Label>
                        <Input
                          id="contactLastName"
                          value={contactLastName}
                          onChange={(e) => setContactLastName(e.target.value)}
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Details (Photos & Notes) */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Photos (Optional)</CardTitle>
                    <p className="text-sm text-muted-foreground">Add up to 3 photos to help us understand the issue</p>
                  </CardHeader>
                  <CardContent>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={photo.dataUrl}
                              alt="Uploaded photo"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemovePhoto(photo.id)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {photos.length < 3 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center w-full hover:border-primary/50 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          {photos.length === 0 ? 'Upload Photos' : 'Add More Photos'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {3 - photos.length} photo{3 - photos.length !== 1 ? 's' : ''} remaining
                        </p>
                      </button>
                    )}
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

            {/* Step 6: Schedule */}
            {currentStep === 6 && (
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

            {/* Step 7: Review */}
            {currentStep === 7 && (
              <div className="space-y-4">
                {/* Service Section */}
                <Card>
                  <CardHeader className="pb-2 flex-row justify-between items-center">
                    <CardTitle className="text-base">Service</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => handleGoToStep(1)}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{service.title}</p>
                    <p className="text-sm text-muted-foreground">{bookingState.quantity} {service.unit}</p>
                  </CardContent>
                </Card>

                {/* Property Section */}
                <Card>
                  <CardHeader className="pb-2 flex-row justify-between items-center">
                    <CardTitle className="text-base">Property</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => handleGoToStep(2)}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="mb-2">
                      {propertyType === 'commercial' ? (
                        <><Building className="w-3 h-3 mr-1" /> Commercial</>
                      ) : (
                        <><Home className="w-3 h-3 mr-1" /> Residential</>
                      )}
                    </Badge>
                    <p className="font-medium">{useNewAddress ? (newAddress.label || 'New Address') : getAddressLabel(selectedAddress)}</p>
                    <p className="text-sm text-muted-foreground">
                      {useNewAddress 
                        ? `${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.zip}` 
                        : getAddressDisplay(selectedAddress)}
                    </p>
                  </CardContent>
                </Card>

                {/* Contact Section */}
                <Card>
                  <CardHeader className="pb-2 flex-row justify-between items-center">
                    <CardTitle className="text-base">Contact</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => handleGoToStep(4)}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="font-medium">{contactFirstName} {contactLastName}</p>
                    <p className="text-sm text-muted-foreground">{contactEmail}</p>
                    <p className="text-sm text-muted-foreground">{contactPhone}</p>
                  </CardContent>
                </Card>

                {/* Photos & Notes Section */}
                {(photos.length > 0 || notes) && (
                  <Card>
                    <CardHeader className="pb-2 flex-row justify-between items-center">
                      <CardTitle className="text-base">Details</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleGoToStep(5)}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {photos.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {photos.map((photo) => (
                            <div key={photo.id} className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              <img
                                src={photo.dataUrl}
                                alt="Uploaded"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {notes && (
                        <p className="text-sm text-muted-foreground">{notes}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Schedule Section */}
                <Card>
                  <CardHeader className="pb-2 flex-row justify-between items-center">
                    <CardTitle className="text-base">Schedule</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => handleGoToStep(6)}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {new Date(preferredDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {TIME_WINDOWS.find(w => w.id === timeWindow)?.label} ({TIME_WINDOWS.find(w => w.id === timeWindow)?.time})
                    </p>
                    {isFlexible && (
                      <p className="text-xs text-primary mt-1">Flexible scheduling enabled</p>
                    )}
                  </CardContent>
                </Card>

                {/* Estimate Section */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="py-4">
                    <div className="text-center">
                      {hasEstimate ? (
                        <>
                          <p className="text-sm text-muted-foreground mb-1">Estimated Price Range</p>
                          <p className="text-2xl font-bold text-primary">
                            ${bookingState.estimateLow.toLocaleString()} - ${bookingState.estimateHigh.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            * Final pricing will be confirmed after on-site inspection
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-1">Pricing</p>
                          <p className="text-lg font-semibold text-foreground">
                            Custom Quote Required
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            A Sons Roofing representative will contact you with pricing details
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-center px-4">
                  By confirming, you agree to our terms of service.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        {currentStep < 7 ? (
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
