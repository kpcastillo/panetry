import { create } from "zustand";
import { fetchProducts } from "../lib/queries";

export const useProductsStore = create((set) => ({
  products: [],
  loading:  false,
  error:    null,

  fetch: async ({ availableOnly = false } = {}) => {
    set({ loading: true, error: null });
    try {
      const products = await fetchProducts({ availableOnly });
      set({ products, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
