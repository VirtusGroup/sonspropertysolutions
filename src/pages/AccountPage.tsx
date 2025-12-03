import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  User,
  MapPin,
  CreditCard,
  Gift,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Building,
  Home,
  Lock,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { Address, PropertyType } from '@/types';
import { toast } from 'sonner';

export default function AccountPage() {
  const { currentUser, updateUser, addAddress, deleteAddress, updateNotificationPreferences, logout } = useStore();
  const [editingProfile, setEditingProfile] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [newAddressPropertyType, setNewAddressPropertyType] = useState<PropertyType>('residential');

  const handleSaveProfile = () => {
    updateUser({ firstName, lastName, email, phone });
    setEditingProfile(false);
    toast.success('Profile updated');
  };

  const handleAddAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      label: formData.get('label') as string,
      street: formData.get('street') as string,
      unit: formData.get('unit') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
      propertyType: newAddressPropertyType,
      isDefault: currentUser?.addresses.length === 0,
    };
    addAddress(newAddress);
    setAddingAddress(false);
    setNewAddressPropertyType('residential');
    toast.success('Address added');
  };

  const handleDeleteAddress = () => {
    if (addressToDelete) {
      deleteAddress(addressToDelete);
      setAddressToDelete(null);
      toast.success('Address deleted');
    }
  };

  const handleSignOut = () => {
    logout();
    toast.success('Signed out');
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
  const initials = `${currentUser.firstName[0] || ''}${currentUser.lastName[0] || ''}`;

  return (
    <div className="flex flex-col min-h-screen pb-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 py-8"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold"
          >
            {initials}
          </motion.div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="opacity-90">{currentUser.email}</p>
            <Badge variant="secondary" className="mt-1">
              {currentUser.tier.toUpperCase()}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 px-4 pt-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle>Profile</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    {editingProfile ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingProfile ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full">
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p>{fullName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{currentUser.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{currentUser.phone || 'Not set'}</p>
                    </div>
                    <Separator className="my-4" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <CardTitle>Saved Addresses</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingAddress(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentUser.addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved addresses</p>
                ) : (
                  currentUser.addresses.map((addr, index) => (
                    <motion.div 
                      key={addr.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium">{addr.label}</p>
                          {addr.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {addr.propertyType === 'commercial' ? (
                              <><Building className="h-3 w-3 mr-1" />Commercial</>
                            ) : (
                              <><Home className="h-3 w-3 mr-1" />Residential</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {addr.street}
                          {addr.unit && `, ${addr.unit}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAddressToDelete(addr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your orders
                    </p>
                  </div>
                  <Switch 
                    checked={currentUser.notificationPreferences?.push ?? true}
                    onCheckedChange={(checked) => updateNotificationPreferences({ push: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive order updates via email
                    </p>
                  </div>
                  <Switch 
                    checked={currentUser.notificationPreferences?.email ?? true}
                    onCheckedChange={(checked) => updateNotificationPreferences({ email: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle>Payment Methods</CardTitle>
                </div>
                <CardDescription>
                  Payment at time of service (demo app)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method (Demo)
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referrals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  <CardTitle>Referrals & Credits</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-accent">${currentUser.credits}</p>
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                </div>
                <div className="space-y-2">
                  <Label>Your Referral Code</Label>
                  <div className="flex gap-2">
                    <Input value={currentUser.referralCode} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(currentUser.referralCode);
                        toast.success('Code copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share with friends to earn $25 credit per referral
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={addingAddress} onOpenChange={setAddingAddress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
            <DialogDescription>Add a new service address</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" placeholder="Home" required />
            </div>
            <div className="space-y-2">
              <Label>Property Type</Label>
              <RadioGroup
                value={newAddressPropertyType}
                onValueChange={(value) => setNewAddressPropertyType(value as PropertyType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="residential" id="residential" />
                  <Label htmlFor="residential" className="flex items-center gap-1 cursor-pointer">
                    <Home className="h-4 w-4" />
                    Residential
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="commercial" id="commercial" />
                  <Label htmlFor="commercial" className="flex items-center gap-1 cursor-pointer">
                    <Building className="h-4 w-4" />
                    Commercial
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" name="street" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit / Apt (optional)</Label>
              <Input id="unit" name="unit" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue="TX" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" name="zip" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddingAddress(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Address</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation */}
      <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this property?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this property? Any active jobs may still reference this address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </div>
  );
}
