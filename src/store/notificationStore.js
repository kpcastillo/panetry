import { create } from "zustand";

const TOAST_TTL = 6000; // ms

export const useNotificationStore = create((set, get) => ({
  toasts:      [],
  unreadCount: 0,

  /** Called when Supabase Realtime fires an INSERT on orders */
  addNewOrder: (order) => {
    const id = Date.now();
    set(s => ({
      toasts:      [...s.toasts, { id, order }],
      unreadCount: s.unreadCount + 1,
    }));
    setTimeout(() => get().dismiss(id), TOAST_TTL);
  },

  dismiss: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  clearUnread: () => set({ unreadCount: 0 }),
}));
