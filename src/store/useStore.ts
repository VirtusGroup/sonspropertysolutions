import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Service, Order, Address, Promo, Notification } from '@/types';
import { demoServices, demoUsers, demoOrders, demoPromos, demoNotifications } from '@/lib/demoData';

interface AppState {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Auth
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'addresses' | 'referralCode' | 'credits' | 'tier'>) => { success: boolean; error?: string };
  
  // Job Reference
  nextJobNumber: number;
  getNextJobRef: () => string;
  
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
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
  
  // Notification Preferences
  updateNotificationPreferences: (preferences: { push?: boolean; email?: boolean }) => void;
  
  // Dev helpers
  resetDemoData: () => void;
  impersonateUser: (userId: string) => void;
  advanceOrderStatus: (orderId: string) => void;
}

const generateReferralCode = (firstName: string) => {
  const code = firstName.toUpperCase().slice(0, 4) + Math.floor(1000 + Math.random() * 9000);
  return code;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),
      
      // Auth functions
      login: (email, password) => {
        const user = demoUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (user) {
          set({ currentUser: user });
          return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
      },
      
      logout: () => set({ currentUser: null }),
      
      registerUser: (userData) => {
        const existingUser = demoUsers.find(
          (u) => u.email.toLowerCase() === userData.email.toLowerCase()
        );
        if (existingUser) {
          return { success: false, error: 'An account with this email already exists' };
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          addresses: [],
          referralCode: generateReferralCode(userData.firstName),
          credits: 0,
          tier: 'regular',
          notificationPreferences: userData.notificationPreferences || { push: true, email: true },
          termsAcceptedAt: userData.termsAcceptedAt,
        };
        
        demoUsers.push(newUser);
        set({ currentUser: newUser });
        return { success: true };
      },
      
      // Job Reference
      nextJobNumber: 10001,
      
      getNextJobRef: () => {
        const num = get().nextJobNumber;
        set({ nextJobNumber: num + 1 });
        return `SR-${num}`;
      },
      
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
          
          const isFirstAddress = state.currentUser.addresses.length === 0;
          const addressToAdd = isFirstAddress || address.isDefault
            ? address
            : { ...address, isDefault: false };
          
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
          unreadNotificationsCount: state.notifications.filter(
            (n) => n.id !== notificationId && !n.read
          ).length,
        })),
      
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadNotificationsCount: 0,
        })),
      
      unreadNotificationsCount: demoNotifications.filter((n) => !n.read).length,
      
      updateNotificationPreferences: (preferences) =>
        set((state) => {
          if (!state.currentUser) return state;
          return {
            currentUser: {
              ...state.currentUser,
              notificationPreferences: {
                ...state.currentUser.notificationPreferences,
                ...preferences,
              },
            },
          };
        }),
      
      resetDemoData: () =>
        set({
          currentUser: null,
          services: demoServices,
          orders: demoOrders,
          promos: demoPromos,
          notifications: demoNotifications,
          unreadNotificationsCount: demoNotifications.filter((n) => !n.read).length,
          nextJobNumber: 10001,
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
            scheduled: 'in_progress',
            in_progress: 'job_complete',
            job_complete: 'finished',
          };
          
          return {
            orders: state.orders.map((order) => {
              if (order.id !== orderId) return order;
              
              const nextStatus = statusProgression[order.status];
              if (!nextStatus) return order;
              
              const updates: Partial<Order> = { status: nextStatus as any };
              
              if (nextStatus === 'scheduled') {
                updates.scheduledAt = new Date().toISOString();
              } else if (nextStatus === 'finished') {
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
        nextJobNumber: state.nextJobNumber,
      }),
    }
  )
);
