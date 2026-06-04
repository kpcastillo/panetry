import { create } from "zustand";
import { fetchBakeryProfile, upsertBakeryProfile } from "../lib/queries";

export const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  saving:  false,
  error:   null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await fetchBakeryProfile();
      set({ profile: profile ?? {}, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  save: async (fields) => {
    set({ saving: true, error: null });
    try {
      const profile = await upsertBakeryProfile(fields);
      set({ profile, saving: false });
      return profile;
    } catch (e) {
      set({ error: e.message, saving: false });
      throw e;
    }
  },
}));
