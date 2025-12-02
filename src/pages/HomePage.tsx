import { useState } from 'react';
import { motion } from 'framer-motion';
import roofingBg from '@/assets/roofing-background.jpg';
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
  Calculator,
  Clock,
  MapPin,
  User,
  MapPinned,
  Gift,
  HelpCircle,
  Phone,
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
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background Image */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-0"
        style={{ 
          backgroundImage: `url(${roofingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm"
        >
          <h1 className="text-xl font-bold text-foreground">
            Sons Property Solutions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quality Service • Family Values
          </p>
        </motion.header>

        {/* Dashboard Grid */}
        <main className="p-2 overflow-hidden">
          <div className="grid grid-cols-4 gap-1.5 auto-rows-fr">
            {/* Primary Actions - Accent colored */}
            <DashboardTile
              icon={CalendarDays}
              label="Book Service"
              href="/services"
              variant="primary"
              index={0}
            />
            <DashboardTile
              icon={ClipboardList}
              label="My Orders"
              href="/orders"
              variant="primary"
              badge={userOrders.length}
              index={1}
            />
            <DashboardTile
              icon={Wrench}
              label="View Services"
              href="/services"
              variant="primary"
              index={2}
            />
            <DashboardTile
              icon={Bell}
              label="Notifications"
              onClick={() => setNotificationsOpen(true)}
              variant="primary"
              badge={unreadCount}
              index={3}
            />

            {/* Tools & Utilities */}
            <DashboardTile
              icon={Calculator}
              label="Price Estimator"
              href="/services"
              index={4}
            />
            <DashboardTile
              icon={Clock}
              label="Business Hours"
              onClick={() => setHoursModalOpen(true)}
              index={5}
            />
            <DashboardTile
              icon={MapPin}
              label="Service Area"
              onClick={() => setAreaModalOpen(true)}
              index={6}
            />
            <DashboardTile
              icon={Phone}
              label="Contact Us"
              href="/contact"
              index={7}
            />

            {/* Account Features */}
            <DashboardTile icon={User} label="My Account" href="/account" index={8} />
            <DashboardTile
              icon={MapPinned}
              label="Addresses"
              href="/account"
              index={9}
            />
            <DashboardTile icon={Gift} label="Referrals" href="/account" index={10} />
            <DashboardTile
              icon={HelpCircle}
              label="Help Center"
              href="/support"
              index={11}
            />
          </div>
        </main>

        {/* Spacer to push promo banner down */}
        <div className="flex-1" />

        {/* Promotional Banner - Anchored at bottom */}
        {activePromo && (
          <div className="mt-auto px-3 pb-1.5">
            <PromoBanner
              title={activePromo.title}
              description={activePromo.description}
              code={activePromo.code}
            />
          </div>
        )}
      </div>

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
