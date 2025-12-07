import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Address {
  street: string;
  city: string;
  zip? : string;
}

export interface OpeningHours {
  weekdayOpen: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
}

export interface Restaurant {
  _id: string;
  restaurantName: string;
  logoURL: string;
  bannerURL: string;
  ratingsSum: number;
  ratingsCount: number;
  slogan: string;
  address: Address;
  openingHours: OpeningHours;
  status: string;
  city: string;
  cuisines: string[];
  temporarilyClosed?: boolean;
  isOpen?: boolean;
}

export interface RestaurantStore {
  restaurants: Restaurant[];
  hydrated: boolean;
  setRestaurants: (restaurants: Restaurant[]) => void;
  clearRestaurants: () => void;
  getRestaurantById: (id: unknown) => Restaurant | undefined;
  setHydrated: (hydrated: boolean) => void;
}

export const useBrowseRestaurantStore = create<RestaurantStore>()(
  persist(
    (set, get) => ({
      restaurants: [],
      hydrated: false,

      setRestaurants: (restaurants) => set({ restaurants }),
      clearRestaurants: () => set({ restaurants: [] }),

      getRestaurantById: (id: unknown) => {
        const normalizedId = String(Array.isArray(id) ? id[0] : id ?? "")
          .trim()
          .replace(/["']/g, "");

        const list = get().restaurants;
        const found = list.find(
          (r) =>
            String(r._id).trim().replace(/["']/g, "") === normalizedId
        );

        return found;
      },

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "restaurants-storage",
      version: 1,
      onRehydrateStorage: () => (store) => {
        if (store) store.setHydrated(true);
      },
    }
  )
);

export const markBrowseStoreHydrated = (store: RestaurantStore) => {
  store.setHydrated(true);
};
