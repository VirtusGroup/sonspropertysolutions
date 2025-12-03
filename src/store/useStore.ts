import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Service, Order, Address, Notification } from '@/types';
import { demoServices } from '@/lib/demoData';

interface AppState {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Registered Users (persisted)
  registeredUsers: User[];
  
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
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
  
  // Notification Preferences
  updateNotificationPreferences: (preferences: { push?: boolean; email?: boolean }) => void;
}

const generateReferralCode = (firstName: string) => {
  const code = firstName.toUpperCase().slice(0, 4) + Math.floor(1000 + Math.random() * 9000);
  return code;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      registeredUsers: [],
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      updateUser: (updates) =>
        set((state) => {
          if (!state.currentUser) return state;
          
          const updatedUser = { ...state.currentUser, ...updates };
          
          // Also update in registeredUsers
          const updatedRegisteredUsers = state.registeredUsers.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          );
          
          return {
            currentUser: updatedUser,
            registeredUsers: updatedRegisteredUsers,
          };
        }),
      
      // Auth functions
      login: (email, password) => {
        const { registeredUsers } = get();
        const user = registeredUsers.find(
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
        const { registeredUsers } = get();
        const existingUser = registeredUsers.find(
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
        
        set((state) => ({
          registeredUsers: [...state.registeredUsers, newUser],
          currentUser: newUser,
        }));
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
      
      orders: [],
      
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
          
          const updatedUser = {
            ...state.currentUser,
            addresses: [...updatedAddresses, addressToAdd],
          };
          
          // Also update in registeredUsers
          const updatedRegisteredUsers = state.registeredUsers.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          );
          
          return {
            currentUser: updatedUser,
            registeredUsers: updatedRegisteredUsers,
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
          
          const updatedUser = {
            ...state.currentUser,
            addresses: updatedAddresses,
          };
          
          // Also update in registeredUsers
          const updatedRegisteredUsers = state.registeredUsers.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          );
          
          return {
            currentUser: updatedUser,
            registeredUsers: updatedRegisteredUsers,
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
          
          const updatedUser = {
            ...state.currentUser,
            addresses: filtered,
          };
          
          // Also update in registeredUsers
          const updatedRegisteredUsers = state.registeredUsers.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          );
          
          return {
            currentUser: updatedUser,
            registeredUsers: updatedRegisteredUsers,
          };
        }),
      
      notifications: [],
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadNotificationsCount: state.unreadNotificationsCount + 1,
        })),
      
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
      
      unreadNotificationsCount: 0,
      
      updateNotificationPreferences: (preferences) =>
        set((state) => {
          if (!state.currentUser) return state;
          
          const updatedUser = {
            ...state.currentUser,
            notificationPreferences: {
              ...state.currentUser.notificationPreferences,
              ...preferences,
            },
          };
          
          // Also update in registeredUsers
          const updatedRegisteredUsers = state.registeredUsers.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          );
          
          return {
            currentUser: updatedUser,
            registeredUsers: updatedRegisteredUsers,
          };
        }),
    }),
    {
      name: 'sons-property-app',
      partialize: (state) => ({
        currentUser: state.currentUser,
        registeredUsers: state.registeredUsers,
        orders: state.orders,
        notifications: state.notifications,
        nextJobNumber: state.nextJobNumber,
      }),
    }
  )
);
