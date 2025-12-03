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
import { User, MapPin, Gift, Bell, LogOut, Plus, Trash2, Building, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type PropertyType = 'residential' | 'commercial';

export default function AccountPage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { addresses, addAddress, deleteAddress } = useAddresses();
  const [editingProfile, setEditingProfile] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [newAddressPropertyType, setNewAddressPropertyType] = useState<PropertyType>('residential');

  const handleSaveProfile = async () => {
    const { error } = await updateProfile({ first_name: firstName, last_name: lastName, phone });
    if (error) {
      toast.error('Failed to update profile');
    } else {
      setEditingProfile(false);
      toast.success('Profile updated');
    }
  };

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addAddress.mutateAsync({
        label: formData.get('label') as string,
        street: formData.get('street') as string,
        unit: (formData.get('unit') as string) || null,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zip: formData.get('zip') as string,
        property_type: newAddressPropertyType,
        is_default: addresses.length === 0,
      });
      setAddingAddress(false);
      setNewAddressPropertyType('residential');
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async () => {
    if (addressToDelete) {
      try {
        await deleteAddress.mutateAsync(addressToDelete);
        setAddressToDelete(null);
        toast.success('Address deleted');
      } catch {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  const handleNotificationToggle = async (key: 'notification_push' | 'notification_email', value: boolean) => {
    await updateProfile({ [key]: value });
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/login">Sign In</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="flex flex-col min-h-screen pb-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">{initials}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="opacity-90">{user.email}</p>
            <Badge variant="secondary" className="mt-1">{profile.tier.toUpperCase()}</Badge>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 px-4 pt-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><User className="h-5 w-5" /><CardTitle>Profile</CardTitle></div>
                <Button variant="ghost" size="sm" onClick={() => setEditingProfile(!editingProfile)}>{editingProfile ? 'Cancel' : 'Edit'}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>First Name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  <Button onClick={handleSaveProfile} className="w-full">Save Changes</Button>
                </>
              ) : (
                <>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Name</p><p>{fullName}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Email</p><p>{user.email}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Phone</p><p>{profile.phone || 'Not set'}</p></div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /><CardTitle>Saved Addresses</CardTitle></div>
                <Button variant="ghost" size="sm" onClick={() => setAddingAddress(true)}><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved addresses</p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium">{addr.label}</p>
                        {addr.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {addr.property_type === 'commercial' ? <><Building className="h-3 w-3 mr-1" />Commercial</> : <><Home className="h-3 w-3 mr-1" />Residential</>}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.street}{addr.unit && `, ${addr.unit}`}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setAddressToDelete(addr.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader><div className="flex items-center gap-2"><Bell className="h-5 w-5" /><CardTitle>Notifications</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Push notifications</p><p className="text-sm text-muted-foreground">Receive updates about your orders</p></div>
                <Switch checked={profile.notification_push} onCheckedChange={(checked) => handleNotificationToggle('notification_push', checked)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Email notifications</p><p className="text-sm text-muted-foreground">Receive order updates via email</p></div>
                <Switch checked={profile.notification_email} onCheckedChange={(checked) => handleNotificationToggle('notification_email', checked)} />
              </div>
            </CardContent>
          </Card>

          {/* Referrals */}
          <Card>
            <CardHeader><div className="flex items-center gap-2"><Gift className="h-5 w-5" /><CardTitle>Referrals & Credits</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-accent">${profile.credits}</p>
                <p className="text-sm text-muted-foreground">Available Credits</p>
              </div>
              <div className="space-y-2">
                <Label>Your Referral Code</Label>
                <div className="flex gap-2">
                  <Input value={profile.referral_code || ''} readOnly />
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(profile.referral_code || ''); toast.success('Code copied!'); }}>Copy</Button>
                </div>
                <p className="text-xs text-muted-foreground">Share with friends to earn $25 credit per referral</p>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={addingAddress} onOpenChange={setAddingAddress}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Address</DialogTitle><DialogDescription>Add a new service address</DialogDescription></DialogHeader>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="label">Label</Label><Input id="label" name="label" placeholder="Home" required /></div>
            <div className="space-y-2">
              <Label>Property Type</Label>
              <RadioGroup value={newAddressPropertyType} onValueChange={(v) => setNewAddressPropertyType(v as PropertyType)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="residential" /><Label htmlFor="residential" className="flex items-center gap-1 cursor-pointer"><Home className="h-4 w-4" />Residential</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="commercial" /><Label htmlFor="commercial" className="flex items-center gap-1 cursor-pointer"><Building className="h-4 w-4" />Commercial</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-2"><Label htmlFor="street">Street Address</Label><Input id="street" name="street" required /></div>
            <div className="space-y-2"><Label htmlFor="unit">Unit / Apt (optional)</Label><Input id="unit" name="unit" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" required /></div>
              <div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" name="state" defaultValue="TX" required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="zip">ZIP Code</Label><Input id="zip" name="zip" required /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddingAddress(false)}>Cancel</Button><Button type="submit">Add Address</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation */}
      <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Address?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove this property? Any active jobs may still reference this address.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAddress}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
