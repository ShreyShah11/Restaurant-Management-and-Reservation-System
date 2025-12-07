import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Address {
  line1: string
  line2: string
  line3: string
  zip: string
  city: string
  state: string
  country: string
}

interface OpeningHoursDay {
  start: string
  end: string
}

interface OpeningHours {
  weekday: OpeningHoursDay
  weekend: OpeningHoursDay
}

interface Status {
  isActive: boolean
  isVerified: boolean
  temporarilyClosed: boolean
}

export interface RestaurantSuper {
  _id: string
  owner: string
  ownerName: string
  restaurantName: string
  restaurantEmail: string
  phoneNumber: string
  about: string
  slogan: string
  since: number
  bannerURL: string
  logoURL: string
  address: Address
  openingHours: OpeningHours
  status: Status
  ratingsSum: number
  ratingsCount: number
  createdAt: string
  updatedAt: string
  __v: number
}

export interface Item {
  _id: string
  dishName: string
  description: string
  cuisine: string
  foodType: "veg" | "non-veg" | "vegan" | "egg"
  price: number
  imageURL: string
  category: string
  restaurantID: string
  isPopular: boolean
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface Booking {
  bookingID: string
  userID: string
  restaurantID: string
  bookingAt: string
  numberOfGuests: number
  message: string
  status: string
  category: string
  phoneNumber: string
  fullName: string
  email: string
}

interface IRestaurantStore {
  restaurant: RestaurantSuper | null
  setRestaurant: (restaurant: RestaurantSuper | null) => void

  items: Item[]
  setItems: (items: Item[]) => void
  addItem: (item: Item) => void
  updateItem: (item: Item) => void
  deleteItem: (id: string) => void
  toggleItemPopular: (id: string) => void
  toggleItemAvailability: (id: string) => void

  // Bookings
  bookings: Booking[]
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void
  updateBookingStatus: (id: string, status: string) => void
  clearBookings: () => void

  reset: () => void
}

export const useRestaurantData = create<IRestaurantStore>()(
  persist(
    (set, get) => ({
      restaurant: null,
      items: [],
      bookings: [],

      // Restaurant
      setRestaurant: (restaurant) => set({ restaurant }),

      // Items
      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      updateItem: (updatedItem) =>
        set((state) => ({
          items: state.items.map((item) =>
            item._id === updatedItem._id ? updatedItem : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== id),
        })),

      toggleItemPopular: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item._id === id ? { ...item, isPopular: !item.isPopular } : item
          ),
        })),

      toggleItemAvailability: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
          ),
        })),

      // Bookings
      setBookings: (bookings) => set({ bookings }),

      addBooking: (booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings],
        })),

      updateBookingStatus: (id, status) =>
        set((state) => ({
          bookings: state.bookings
            .map((b) => (b.bookingID === id ? { ...b, status } : b))
            .sort(
              (a, b) =>
                new Date(b.bookingAt).getTime() - new Date(a.bookingAt).getTime()
            ),
        })),

      clearBookings: () => set({ bookings: [] }),

      reset: () =>
        set({
          restaurant: null,
          items: [],
          bookings: [],
        }),
    }),
    {
      name: "restaurant-storage",
    }
  )
)
