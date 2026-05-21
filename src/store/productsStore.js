import { create } from "zustand";
import { fetchProducts, createProduct, updateProduct, deleteProduct, updateStock } from "../lib/queries";

export const useProductsStore = create((set, get) => ({
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

  create: async (fields) => {
    const product = await createProduct(fields);
    set(s => ({ products: [...s.products, product].sort((a, b) => a.name.localeCompare(b.name)) }));
    return product;
  },

  update: async (id, fields) => {
    const updated = await updateProduct(id, fields);
    set(s => ({ products: s.products.map(p => p.id === id ? updated : p) }));
    return updated;
  },

  delete: async (id) => {
    await deleteProduct(id);
    set(s => ({ products: s.products.filter(p => p.id !== id) }));
  },

  setStock: async (id, stock) => {
    const clamped = Math.max(0, stock);
    // Optimistic
    set(s => ({ products: s.products.map(p => p.id === id ? { ...p, stock: clamped } : p) }));
    try {
      await updateStock(id, clamped);
    } catch {
      get().fetch();
    }
  },

  adjustStock: async (id, delta) => {
    const product = get().products.find(p => p.id === id);
    if (!product) return;
    get().setStock(id, product.stock + delta);
  },

  toggleAvailable: async (id) => {
    const product = get().products.find(p => p.id === id);
    if (!product) return;
    // Optimistic
    set(s => ({ products: s.products.map(p => p.id === id ? { ...p, available: !p.available } : p) }));
    try {
      await updateProduct(id, { available: !product.available });
    } catch {
      get().fetch(); // roll back
    }
  },
}));
