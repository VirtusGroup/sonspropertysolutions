import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Order, Photo } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { services, currentUser, addOrder } = useStore();
  
  const prefilledData = location.state || {};
  
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  // Step 1: Service Selection
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    prefilledData.serviceId || ''
  );
  const [quantity, setQuantity] = useState<number>(prefilledData.quantity || 1);
  const [roofType, setRoofType] = useState<string>(prefilledData.roofType || 'asphalt');
  const [stories, setStories] = useState<number>(prefilledData.stories || 1);
  const [addonIds, setAddonIds] = useState<string[]>(prefilledData.addonIds || []);
  
  // Step 2: Address
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('');
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Step 3: Photos
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  // Step 4: Schedule
  const [preferredWindow, setPreferredWindow] = useState('');
  const [notes, setNotes] = useState('');
  
  // Step 5: Review
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const estimateLow = prefilledData.estimateLow || 0;
  const estimateHigh = prefilledData.estimateHigh || 0;

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedServiceId !== '';
      case 2:
        if (useExistingAddress) {
          return selectedAddressId !== '' && name && phone && email;
        }
        return name && phone && email && street && city && state && zip;
      case 3:
        return true; // Photos optional
      case 4:
        return preferredWindow !== '';
      case 5:
        return agreedToTerms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setStep((s) => Math.min(s + 1, totalSteps));
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random()}`,
          dataUrl,
          caption: file.name,
        };
        setPhotos((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSubmit = () => {
    if (!canProceed() || !selectedService) {
      toast.error('Please complete all required fields');
      return;
    }

    // Create address ID (use existing or create new)
    let addressId = selectedAddressId;
    if (!useExistingAddress) {
      addressId = `addr-${Date.now()}`;
      // In a real app, we'd save this new address to the user's addresses
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      serviceId: selectedServiceId,
      addonIds,
      addressId,
      photos,
      preferredWindow,
      notes,
      estimateLow,
      estimateHigh,
      status: 'received',
      createdAt: new Date().toISOString(),
      quantity: selectedService.unit !== 'fixed' ? quantity : undefined,
      roofType: selectedService.category === 'roofing' ? roofType : undefined,
      stories: selectedService.category === 'roofing' ? stories : undefined,
    };

    addOrder(newOrder);
    toast.success('Service request submitted!');
    navigate(`/orders/${newOrder.id}`);
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Progress */}
      <div className="sticky top-14 z-40 bg-background border-b px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Book Service</h1>
            <Badge variant="secondary">
              Step {step} of {totalSteps}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Service */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Service</CardTitle>
                <CardDescription>Choose the service you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Service *</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedService && selectedService.unit !== 'fixed' && (
                  <div className="space-y-2">
                    <Label>Quantity ({selectedService.unit.replace('_', ' ')}) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                )}

                {selectedService && selectedService.category === 'roofing' && (
                  <>
                    <div className="space-y-2">
                      <Label>Roof Type *</Label>
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
                      <Label>Number of Stories *</Label>
                      <Select value={stories.toString()} onValueChange={(val) => setStories(Number(val))}>
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

                {selectedService && selectedService.addons.length > 0 && (
                  <div className="space-y-3">
                    <Label>Add-ons (Optional)</Label>
                    {selectedService.addons.map((addon) => (
                      <div key={addon.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={addon.id}
                          checked={addonIds.includes(addon.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAddonIds([...addonIds, addon.id]);
                            } else {
                              setAddonIds(addonIds.filter((id) => id !== addon.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={addon.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {addon.title} (+${addon.price})
                          </label>
                          <p className="text-xs text-muted-foreground">{addon.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Service Address & Contact</CardTitle>
                <CardDescription>Where should we provide the service?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                {currentUser && currentUser.addresses.length > 0 && (
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="use-existing"
                      checked={useExistingAddress}
                      onCheckedChange={(checked) => setUseExistingAddress(checked as boolean)}
                    />
                    <label htmlFor="use-existing" className="text-sm cursor-pointer">
                      Use a saved address
                    </label>
                  </div>
                )}

                {useExistingAddress ? (
                  <div className="space-y-2">
                    <Label>Select Address *</Label>
                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUser?.addresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
                            {addr.label} - {addr.street}, {addr.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit / Apt (Optional)</Label>
                      <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP *</Label>
                        <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Photos (Optional)</CardTitle>
                <CardDescription>
                  Photos help us provide accurate estimates. Close-ups of the problem area work best.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label
                    htmlFor="photo-upload"
                    className="cursor-pointer text-sm text-primary hover:underline"
                  >
                    Click to upload photos
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Max 10MB per file. Up to 10 photos.
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.dataUrl}
                          alt={photo.caption}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(photo.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Preferred Schedule</CardTitle>
                <CardDescription>When would you like us to come?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred-window">Preferred Date/Time *</Label>
                  <Select value={preferredWindow} onValueChange={setPreferredWindow}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time window" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASAP">ASAP (Next Available)</SelectItem>
                      <SelectItem value="This Week">This Week, Any Day</SelectItem>
                      <SelectItem value="Next Week">Next Week, Any Day</SelectItem>
                      <SelectItem value="Morning">Weekday Mornings (8am-12pm)</SelectItem>
                      <SelectItem value="Afternoon">Weekday Afternoons (12pm-5pm)</SelectItem>
                      <SelectItem value="Weekend">Weekend Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Gate codes, parking instructions, pets, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review */}
          {step === 5 && selectedService && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Please review your service request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Service</h3>
                  <p>{selectedService.title}</p>
                  {addonIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {addonIds.map((addonId) => {
                        const addon = selectedService.addons.find((a) => a.id === addonId);
                        return addon ? (
                          <Badge key={addon.id} variant="secondary">
                            {addon.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p>{name}</p>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Service Address</h3>
                  {useExistingAddress && selectedAddressId ? (
                    <>
                      {currentUser?.addresses.find((a) => a.id === selectedAddressId)?.street}
                    </>
                  ) : (
                    <>
                      <p>{street}</p>
                      {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
                      <p className="text-sm text-muted-foreground">
                        {city}, {state} {zip}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Preferred Time</h3>
                  <p>{preferredWindow}</p>
                </div>

                {photos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Photos</h3>
                    <p className="text-sm text-muted-foreground">{photos.length} photo(s) uploaded</p>
                  </div>
                )}

                {estimateLow > 0 && estimateHigh > 0 && (
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h3 className="font-semibold mb-1">Estimated Price Range</h3>
                    <div className="text-2xl font-bold text-primary">
                      ${estimateLow} - ${estimateHigh}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      * Final pricing may change after on-site inspection
                    </p>
                  </div>
                )}

                <div className="flex items-start space-x-3 pt-4 border-t">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to the terms and conditions. I understand that this is a service request
                    and not a confirmed booking. Final pricing will be determined after inspection.
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed()} size="lg">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
