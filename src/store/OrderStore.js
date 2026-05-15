import { create } from "zustand";
import { fetchOrders, updateOrderStatus } from "../lib/queries";

export const useOrderStore = create((set, get) => ({
  orders:  [],
  loading: false,
  error:   null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await fetchOrders();
      set({ orders, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateStatus: async (id, status) => {
    // Optimistic update
    set(state => ({
      orders: state.orders.map(o => (o.id === id ? { ...o, status } : o)),
    }));
    try {
      await updateOrderStatus(id, status);
    } catch {
      get().fetch(); // roll back on failure
    }
  },
}));
