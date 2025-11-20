import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Service, Order, Address, Promo, Notification } from '@/types';
import { demoServices, demoUsers, demoOrders, demoPromos, demoNotifications } from '@/lib/demoData';

interface AppState {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Services
  services: Service[];
  
  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  
  // Addresses
  addAddress: (address: Address) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  deleteAddress: (addressId: string) => void;
  
  // Promos
  promos: Promo[];
  togglePromos: () => void;
  
  // Notifications
  notifications: Notification[];
  markNotificationRead: (notificationId: string) => void;
  unreadNotificationsCount: number;
  
  // Dev helpers
  resetDemoData: () => void;
  impersonateUser: (userId: string) => void;
  advanceOrderStatus: (orderId: string) => void;
}

const getInitialUser = () => {
  // Default to guest user
  return demoUsers[0];
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: getInitialUser(),
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),
      
      services: demoServices,
      
      orders: demoOrders,
      
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      
      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, ...updates } : order
          ),
        })),
      
      addAddress: (address) =>
        set((state) => {
          if (!state.currentUser) return state;
          
          // If this is the first address or marked as default, set as default
          const isFirstAddress = state.currentUser.addresses.length === 0;
          const addressToAdd = isFirstAddress || address.isDefault
            ? address
            : { ...address, isDefault: false };
          
          // If setting as default, unset others
          const updatedAddresses = address.isDefault
            ? state.currentUser.addresses.map((a) => ({ ...a, isDefault: false }))
            : state.currentUser.addresses;
          
          return {
            currentUser: {
              ...state.currentUser,
              addresses: [...updatedAddresses, addressToAdd],
            },
          };
        }),
      
      updateAddress: (addressId, updates) =>
        set((state) => {
          if (!state.currentUser) return state;
          
          let updatedAddresses = state.currentUser.addresses.map((addr) =>
            addr.id === addressId ? { ...addr, ...updates } : addr
          );
          
          // If setting as default, unset others
          if (updates.isDefault) {
            updatedAddresses = updatedAddresses.map((a) =>
              a.id === addressId ? a : { ...a, isDefault: false }
            );
          }
          
          return {
            currentUser: {
              ...state.currentUser,
              addresses: updatedAddresses,
            },
          };
        }),
      
      deleteAddress: (addressId) =>
        set((state) => {
          if (!state.currentUser) return state;
          
          const filtered = state.currentUser.addresses.filter(
            (a) => a.id !== addressId
          );
          
          // If we deleted the default and there are others, make first one default
          const hasDefault = filtered.some((a) => a.isDefault);
          if (!hasDefault && filtered.length > 0) {
            filtered[0].isDefault = true;
          }
          
          return {
            currentUser: {
              ...state.currentUser,
              addresses: filtered,
            },
          };
        }),
      
      promos: demoPromos,
      
      togglePromos: () =>
        set((state) => ({
          promos: state.promos.map((p) => ({ ...p, active: !p.active })),
        })),
      
      notifications: demoNotifications,
      
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        })),
      
      unreadNotificationsCount: demoNotifications.filter((n) => !n.read).length,
      
      resetDemoData: () =>
        set({
          currentUser: getInitialUser(),
          services: demoServices,
          orders: demoOrders,
          promos: demoPromos,
          notifications: demoNotifications,
          unreadNotificationsCount: demoNotifications.filter((n) => !n.read).length,
        }),
      
      impersonateUser: (userId) => {
        const user = demoUsers.find((u) => u.id === userId);
        if (user) {
          set({ currentUser: user });
        }
      },
      
      advanceOrderStatus: (orderId) =>
        set((state) => {
          const statusProgression: Record<string, string> = {
            received: 'scheduled',
            scheduled: 'on-site',
            'on-site': 'completed',
          };
          
          return {
            orders: state.orders.map((order) => {
              if (order.id !== orderId) return order;
              
              const nextStatus = statusProgression[order.status];
              if (!nextStatus) return order;
              
              const updates: Partial<Order> = { status: nextStatus as any };
              
              if (nextStatus === 'scheduled') {
                updates.scheduledAt = new Date().toISOString();
              } else if (nextStatus === 'completed') {
                updates.completedAt = new Date().toISOString();
              }
              
              return { ...order, ...updates };
            }),
          };
        }),
    }),
    {
      name: 'sons-property-app',
      partialize: (state) => ({
        currentUser: state.currentUser,
        orders: state.orders,
        promos: state.promos,
        notifications: state.notifications,
      }),
    }
  )
);
