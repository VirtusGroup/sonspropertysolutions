import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { DashboardTile } from '@/components/DashboardTile';
import { PromoBanner } from '@/components/PromoBanner';
import { BusinessHoursModal } from '@/components/modals/BusinessHoursModal';
import { ServiceAreaModal } from '@/components/modals/ServiceAreaModal';
import { NotificationsDrawer } from '@/components/drawers/NotificationsDrawer';
import {
  CalendarDays,
  ClipboardList,
  Wrench,
  Bell,
  Home,
  Droplets,
  AlertTriangle,
  Settings,
  Calculator,
  Clock,
  MapPin,
  Star,
  User,
  MapPinned,
  CreditCard,
  Gift,
  Phone,
  MessageSquare,
  Mail,
  HelpCircle,
} from 'lucide-react';

export default function HomePage() {
  const { promos, orders, currentUser, notifications } = useStore();
  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const activePromo = promos.find((p) => p.active);
  const userOrders = orders.filter((o) => o.userId === currentUser?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border bg-card">
        <h1 className="text-xl font-bold text-foreground">
          Sons Property Solutions
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quality Service • Family Values
        </p>
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 p-3">
        <div className="grid grid-cols-4 gap-1 mb-3">
          {/* Primary Actions - Accent colored */}
          <DashboardTile
            icon={CalendarDays}
            label="Book Service"
            href="/book"
            variant="primary"
          />
          <DashboardTile
            icon={ClipboardList}
            label="My Orders"
            href="/orders"
            variant="primary"
            badge={userOrders.length}
          />
          <DashboardTile
            icon={Wrench}
            label="View Services"
            href="/services"
            variant="primary"
          />
          <DashboardTile
            icon={Bell}
            label="Notifications"
            onClick={() => setNotificationsOpen(true)}
            variant="primary"
            badge={unreadCount}
          />

          {/* Service Categories */}
          <DashboardTile
            icon={Home}
            label="Roofing Services"
            href="/services?category=roofing"
          />
          <DashboardTile
            icon={Droplets}
            label="Gutter Services"
            href="/services?category=gutters"
          />
          <DashboardTile
            icon={AlertTriangle}
            label="Emergency"
            href="/services?category=storm"
          />
          <DashboardTile
            icon={Settings}
            label="Maintenance"
            href="/services?category=maintenance"
          />

          {/* Tools & Utilities */}
          <DashboardTile
            icon={Calculator}
            label="Price Estimator"
            href="/book"
          />
          <DashboardTile
            icon={Clock}
            label="Business Hours"
            onClick={() => setHoursModalOpen(true)}
          />
          <DashboardTile
            icon={MapPin}
            label="Service Area"
            onClick={() => setAreaModalOpen(true)}
          />
          <DashboardTile icon={Star} label="Favorites" disabled />

          {/* Account Features */}
          <DashboardTile icon={User} label="My Account" href="/account" />
          <DashboardTile
            icon={MapPinned}
            label="Addresses"
            href="/account"
          />
          <DashboardTile icon={CreditCard} label="Payment" disabled />
          <DashboardTile icon={Gift} label="Referrals" href="/account" />

          {/* Communication */}
          <DashboardTile
            icon={Phone}
            label="Call Us"
            href="tel:+18172310171"
          />
          <DashboardTile
            icon={MessageSquare}
            label="Text Us"
            href="sms:+18172310171"
          />
          <DashboardTile
            icon={Mail}
            label="Email"
            href="mailto:support@sonsroofs.com"
          />
          <DashboardTile
            icon={HelpCircle}
            label="Help Center"
            href="/support"
          />
        </div>

        {/* Promotional Banner */}
        {activePromo && (
          <PromoBanner
            title={activePromo.title}
            description={activePromo.description}
            code={activePromo.code}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <BusinessHoursModal
        open={hoursModalOpen}
        onOpenChange={setHoursModalOpen}
      />
      <ServiceAreaModal open={areaModalOpen} onOpenChange={setAreaModalOpen} />
      <NotificationsDrawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
}
