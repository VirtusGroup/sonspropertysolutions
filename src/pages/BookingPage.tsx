import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { useOrders, CreateOrderInput } from '@/hooks/useOrders';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Camera,
  FileText,
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

type PropertyType = 'residential' | 'commercial';

interface BookingState {
  serviceId: string;
  quantity: number;
  roofType: string;
  stories: number;
  addonIds: string[];
  estimateLow: number;
  estimateHigh: number;
}

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
}

const STEPS = [
  { id: 1, title: 'Property', icon: Building },
  { id: 2, title: 'Address', icon: MapPin },
  { id: 3, title: 'Contact', icon: Phone },
  { id: 4, title: 'Details', icon: Camera },
  { id: 5, title: 'Schedule', icon: Calendar },
  { id: 6, title: 'Review', icon: FileText },
];

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM' },
  { id: 'evening', label: 'Evening', time: '4:00 PM - 7:00 PM' },
];

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { services } = useStore();
  const { user, profile } = useAuth();
  const { addresses, addAddress: addAddressMutation } = useAddresses();
  const { createOrder } = useOrders();
  const { uploadPhoto, savePhotoRecord } = usePhotoUpload();
  const bookingState = location.state as BookingState | null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Property Type (Step 1)
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  
  // Address (Step 2)
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', zip: '' });
  const [useNewAddress, setUseNewAddress] = useState(false);
  
  // Contact Info (Step 3)
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Details (Step 4)
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [notes, setNotes] = useState('');
  
  // Schedule (Step 5)
  const [preferredDate, setPreferredDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('morning');
  const [isFlexible, setIsFlexible] = useState(false);
  
  // Confirmation state
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedJobRef, setConfirmedJobRef] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const service = bookingState ? services.find(s => s.id === bookingState.serviceId) : null;

  // Filter addresses by property type
  const filteredAddresses = addresses.filter(a => a.property_type === propertyType);

  // Check auth on mount
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to book a service');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!bookingState || !service) {
      navigate('/services');
    }
  }, [bookingState, service, navigate]);

  // Pre-fill contact info from profile
  useEffect(() => {
    if (profile) {
      setContactFirstName(profile.first_name || '');
      setContactLastName(profile.last_name || '');
      setContactPhone(profile.phone || '');
    }
    if (user) {
      setContactEmail(user.email || '');
    }
  }, [profile, user]);

  // Set default address when property type changes
  useEffect(() => {
    const matchingAddresses = addresses.filter(a => a.property_type === propertyType);
    if (matchingAddresses.length) {
      const primary = matchingAddresses.find(a => a.is_default) || matchingAddresses[0];
      setSelectedAddress(primary.id);
      setUseNewAddress(false);
    } else {
      setSelectedAddress('');
      setUseNewAddress(true);
    }
  }, [addresses, propertyType]);

  if (!bookingState || !service || !user) {
    return null;
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!propertyType;
      case 2: return !!selectedAddress;
      case 3: return contactFirstName && contactLastName && contactEmail && contactPhone;
      case 4: return notes.trim().length > 0; // Notes are required
      case 5: return preferredDate && timeWindow;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 6 && canProceed()) {
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
    const remaining = 1 - photos.length;
    
    files.slice(0, remaining).forEach(file => {
      const preview = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { 
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        file,
        preview
      }]);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get address snapshot
      const address = addresses.find(a => a.id === selectedAddress);
      const addressSnapshot = address ? {
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        unit: address.unit,
      } : null;

      const orderInput: CreateOrderInput = {
        service_id: bookingState.serviceId,
        service_category: service.category,
        address_id: selectedAddress || null,
        address_snapshot: addressSnapshot,
        property_type: propertyType,
        contact_first_name: contactFirstName,
        contact_last_name: contactLastName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        preferred_window: `${TIME_WINDOWS.find(w => w.id === timeWindow)?.label} (${TIME_WINDOWS.find(w => w.id === timeWindow)?.time})`,
        notes: notes || undefined,
        scheduled_at: preferredDate || undefined,
      };

      const order = await createOrder.mutateAsync(orderInput);

      // Upload photos
      for (const photo of photos) {
        const result = await uploadPhoto(photo.file);
        if (result) {
          await savePhotoRecord(order.id, result.path, photo.file);
        }
      }

      setConfirmedJobRef(order.job_ref);
      setConfirmedOrderId(order.id);
      setIsConfirmed(true);
    } catch (error) {
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAddressDisplay = (addressId: string) => {
    const addr = addresses.find(a => a.id === addressId);
    if (!addr) return '';
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
  };

  const getAddressLabel = (addressId: string) => {
    const addr = addresses.find(a => a.id === addressId);
    return addr?.label || 'Home';
  };

  const handleAddressSelect = (addrId: string) => {
    const addr = addresses.find(a => a.id === addrId);
    if (addr) {
      setSelectedAddress(addrId);
      setUseNewAddress(false);
    }
  };

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
          <h1 className="text-lg font-semibold text-foreground">
            Book Service <span className="text-muted-foreground">•</span> {service.title}
          </h1>
        </div>

        {/* Progress Steps */}
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
            {/* Step 1: Property Type */}
            {currentStep === 1 && (
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

            {/* Step 2: Select Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Service Location</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Showing {propertyType} addresses only
                    </p>
                  </CardHeader>
                  <CardContent>
                    {filteredAddresses.length ? (
                      <RadioGroup value={useNewAddress ? 'new' : selectedAddress} onValueChange={(val) => {
                        if (val === 'new') {
                          setUseNewAddress(true);
                        } else {
                          handleAddressSelect(val);
                        }
                      }}>
                        {filteredAddresses.map(addr => (
                          <div key={addr.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border mb-2">
                            <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                            <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                {addr.property_type === 'commercial' ? (
                                  <Building className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Home className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="font-medium">{addr.label}</span>
                                {addr.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                            </Label>
                          </div>
                        ))}
                        <div 
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed cursor-pointer ${useNewAddress ? 'border-primary bg-primary/5' : 'border-border'}`}
                          onClick={() => setUseNewAddress(true)}
                        >
                          <RadioGroupItem value="new" id="new-addr" />
                          <Label htmlFor="new-addr" className="flex items-center gap-2 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            <span>Add new {propertyType} address</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <p className="text-muted-foreground mb-4">No saved {propertyType} addresses. Add one below.</p>
                    )}
                    
                    {(useNewAddress || !filteredAddresses.length) && (
                      <div className="mt-4 space-y-3">
                        <div className="space-y-2">
                          <Label>Address Label</Label>
                          <Input placeholder="Home" value={newAddress.label} onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Street Address</Label>
                          <Input value={newAddress.street} onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input value={newAddress.city} onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Input value={newAddress.state} onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))} placeholder="TX" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP Code</Label>
                          <Input value={newAddress.zip} onChange={(e) => setNewAddress(prev => ({ ...prev, zip: e.target.value }))} />
                        </div>
                        <Button
                          type="button"
                          className="w-full mt-2"
                          disabled={!newAddress.street || !newAddress.city || !newAddress.zip || addAddressMutation.isPending}
                          onClick={async () => {
                            try {
                              const result = await addAddressMutation.mutateAsync({
                                label: newAddress.label || 'Home',
                                street: newAddress.street,
                                city: newAddress.city,
                                state: newAddress.state || 'TX',
                                zip: newAddress.zip,
                                property_type: propertyType,
                                is_default: addresses.length === 0,
                                unit: null,
                              });
                              setSelectedAddress(result.id);
                              setUseNewAddress(false);
                              setNewAddress({ label: '', street: '', city: '', state: '', zip: '' });
                              toast.success('Address saved');
                            } catch {
                              toast.error('Failed to save address');
                            }
                          }}
                        >
                          {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={contactFirstName} onChange={(e) => setContactFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={contactLastName} onChange={(e) => setContactLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Details */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Photos (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Upload 1 photo to help us understand the issue</p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map(photo => (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={photo.preview} alt="Upload" className="w-full h-full object-cover" />
                          <button onClick={() => handleRemovePhoto(photo.id)} className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {photos.length < 1 && (
                        <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Add Photo</span>
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Notes <span className="text-destructive">*</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Describe what's going on and where the issue is..." 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      rows={4}
                      className={!notes.trim() ? 'border-destructive/50' : ''}
                    />
                    {!notes.trim() && (
                      <p className="text-xs text-destructive mt-2">Notes are required to proceed</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Schedule */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Preferred Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Preferred Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={timeWindow} onValueChange={setTimeWindow}>
                      {TIME_WINDOWS.map(tw => (
                        <div key={tw.id} className={`flex items-center space-x-3 p-3 rounded-lg border mb-2 cursor-pointer ${timeWindow === tw.id ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setTimeWindow(tw.id)}>
                          <RadioGroupItem value={tw.id} id={tw.id} />
                          <Label htmlFor={tw.id} className="flex-1 cursor-pointer">
                            <span className="font-medium">{tw.label}</span>
                            <span className="text-sm text-muted-foreground ml-2">{tw.time}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox id="flexible" checked={isFlexible} onCheckedChange={(c) => setIsFlexible(c as boolean)} />
                      <Label htmlFor="flexible" className="text-sm cursor-pointer">I'm flexible with timing</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Review Your Request</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div><p className="text-sm text-muted-foreground">Service</p><p className="font-medium">{service.title}</p></div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><Pencil className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex justify-between items-start">
                      <div><p className="text-sm text-muted-foreground">Property Type</p><p className="font-medium capitalize">{propertyType}</p></div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}><Pencil className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex justify-between items-start">
                      <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{getAddressLabel(selectedAddress)}</p><p className="text-sm text-muted-foreground">{getAddressDisplay(selectedAddress)}</p></div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}><Pencil className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex justify-between items-start">
                      <div><p className="text-sm text-muted-foreground">Contact</p><p className="font-medium">{contactFirstName} {contactLastName}</p><p className="text-sm text-muted-foreground">{contactEmail}</p><p className="text-sm text-muted-foreground">{contactPhone}</p></div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}><Pencil className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex justify-between items-start">
                      <div><p className="text-sm text-muted-foreground">Preferred Date</p><p className="font-medium">{preferredDate || 'Not set'}</p><p className="text-sm text-muted-foreground">{TIME_WINDOWS.find(w => w.id === timeWindow)?.label} ({TIME_WINDOWS.find(w => w.id === timeWindow)?.time})</p></div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)}><Pencil className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          {currentStep < 6 ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}