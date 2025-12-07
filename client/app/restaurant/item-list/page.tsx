"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Eye } from "lucide-react"
import { ItemsGrid } from "@/components/items-grid"
import { AddItemForm } from "@/components/add-item-form"
import { ItemsFilter } from "@/components/items-filter"
import { MenuPreview } from "@/components/menu-preview"
import { HeroSection } from "@/components/categories-stats"
import { useRestaurantData, type Item } from "@/store/restaurant"
import { useRouter } from "next/navigation"
import { backend } from "@/config/backend"

interface FilterState {
  cuisine: string
  category: string
  priceRange: [number, number]
  foodType: string
  search: string
}

interface GroupedItemsMap {
  [key: string]: {
    cuisine: string
    category: string
    items: Item[]
  }
}

const CUISINES: string[] = [
  "South Indian",
  "North Indian",
  "Gujarati",
  "Chinese",
  "Italian",
  "Mexican",
  "Thai",
  "Japanese",
  "American",
  "Continental",
  "Mediterranean",
  "French",
  "Korean",
  "Vietnamese",
  "Middle Eastern",
  "Fusion",
  "Other",
]

const CATEGORIES: string[] = ["Appetizer", "Main Course", "Dessert", "Beverage", "Snack", "Breakfast", "Salad", "Soup"]

const FOOD_TYPES: Array<{ value: string; label: string }> = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "egg", label: "Egg" },
]

export default function RestaurantItemsPage() {
  const { items, setItems, addItem, updateItem, deleteItem } = useRestaurantData()

  const [filteredItems, setFilteredItems] = useState<Item[]>(items)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false)
  const [deleteItemId, setDeleteItemId] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<number>(10000)
  const [filters, setFilters] = useState<FilterState>({
    cuisine: "",
    category: "",
    priceRange: [0, 10000],
    foodType: "",
    search: "",
  })
  const {restaurant}=useRestaurantData()
  const router=useRouter();

  useEffect(() => {
    if (!restaurant) {
        router.replace('/restaurant/dashboard');
    }
});

if (!restaurant) {
    return null;
}

  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await backend.post("/api/v1/restaurants/get-items-by-restaurant",{
        restaurantID:restaurant._id
      })
      if (response.data.success && response.data.items) {
        const fetchedItems: Item[] = response.data.items.map((item: Item) => ({
          ...item,
          isPopular: item.isPopular || false,
          isAvailable: item.isAvailable !== false,
        }))
        setItems(fetchedItems)
        if (fetchedItems.length > 0) {
          const max: number = Math.max(...fetchedItems.map((item: Item) => item.price))
          const calculatedMaxPrice: number = Math.ceil(max / 100) * 100
          setMaxPrice(Math.max(calculatedMaxPrice, 10000))
        } else {
          setMaxPrice(10000)
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (): void => {
    let filtered: Item[] = [...items]

    if (filters.search.trim().length > 0) {
      filtered = filtered.filter((item: Item) => item.dishName.toLowerCase().includes(filters.search.toLowerCase()))
    }

    if (filters.cuisine.trim().length > 0 && filters.cuisine !== "all") {
      filtered = filtered.filter((item: Item) => item.cuisine === filters.cuisine)
    }

    if (filters.category.trim().length > 0 && filters.category !== "all") {
      filtered = filtered.filter((item: Item) => item.category === filters.category)
    }

    if (filters.foodType.trim().length > 0 && filters.foodType !== "all") {
      filtered = filtered.filter((item: Item) => item.foodType === filters.foodType)
    }

    filtered = filtered.filter(
      (item: Item) => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1],
    )

    setFilteredItems(filtered)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [items, filters])

  const handleAddItem = async (
    formData: Omit<Item, "_id" | "restaurantID" | "createdAt" | "updatedAt">,
  ): Promise<void> => {
    try {
      const response = await backend.post("/api/v1/restaurants/add-item", formData)
      if (response.data.success && response.data.data) {
        const newItem: Item = {
          ...response.data.data,
          isPopular: false,
          isAvailable: true,
        }
        addItem(newItem)
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const handleUpdateItem = async (
    formData: Omit<Item, "_id" | "restaurantID" | "createdAt" | "updatedAt">,
  ): Promise<void> => {
    if (!selectedItem) return

    try {
      const response = await backend.post("/api/v1/restaurants/update-item", {
        itemID: selectedItem._id,
        ...formData,
      })
      if (response.data.success && response.data.item) {
        const updatedItemData: Item = {
          ...response.data.item,
          isPopular: selectedItem.isPopular,
          isAvailable: selectedItem.isAvailable,
        }
        updateItem(updatedItemData)
        setIsEditDialogOpen(false)
        setSelectedItem(null)
      }
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleDeleteItem = async (): Promise<void> => {
    if (!deleteItemId) return

    try {
      const response = await backend.post("/api/v1/restaurants/delete-item", {
        itemID: deleteItemId,
      })
      if (response.data.success) {
        deleteItem(deleteItemId)
        setIsDeleteDialogOpen(false)
        setDeleteItemId("")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const groupedItems: GroupedItemsMap = filteredItems.reduce(
    (acc: GroupedItemsMap, item: Item) => {
      const key: string = `${item.cuisine}-${item.category}`
  
      if (!acc[key]) {
        acc[key] = {
          cuisine: item.cuisine,
          category: item.category,
          items: []
        }
      }
  
      acc[key].items.push(item)
      return acc
    },
    {}
  )
  

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      

      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <HeroSection
          totalItems={items.length}
          totalCategories={new Set(items.map((i) => i.category)).size}
          activeItems={items.filter((i) => i.isAvailable).length}
          popularItems={items.filter((i) => i.isPopular).length}
        />

        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Menu Management</h2>
            <p className="mt-2 text-sm text-muted-foreground">Organize and manage your restaurant's complete menu</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Customer Menu Preview</DialogTitle>
                  <DialogDescription>How your menu appears to customers</DialogDescription>
                </DialogHeader>
                <MenuPreview items={items} />
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="h-5 w-5" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                  <DialogDescription>Add a new dish to your restaurant menu</DialogDescription>
                </DialogHeader>
                <AddItemForm onSubmit={handleAddItem} onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">Loading your menu items...</p>
          </div>
        ) : (
          <>
            <ItemsFilter
              filters={filters}
              onFilterChange={setFilters}
              cuisines={CUISINES}
              categories={CATEGORIES}
              foodTypes={FOOD_TYPES}
              maxPrice={maxPrice}
            />

            {filteredItems.length === 0 ? (
              <Card className="mt-8 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground mb-2">No items found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {items.length === 0 ? "Start by adding your first menu item" : "Try adjusting your filters"}
                    </p>
                    {items.length === 0 && (
                      <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-8 space-y-8">
                {Object.entries(groupedItems).map(([key, group]) => (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-1 w-8 bg-linear-to-r from-primary to-primary/60 rounded-full"></div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{group.cuisine}</h2>
                        <p className="text-xs text-muted-foreground">{group.category}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {group.items.length} {group.items.length === 1 ? "item" : "items"}
                      </Badge>
                    </div>
                    <ItemsGrid
                      items={group.items}
                      onEdit={(item: Item) => {
                        setSelectedItem(item)
                        setIsEditDialogOpen(true)
                      }}
                      onDelete={(item: Item) => {
                        setDeleteItemId(item._id)
                        setIsDeleteDialogOpen(true)
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>Update the details of your menu item</DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <AddItemForm
                initialData={selectedItem}
                onSubmit={handleUpdateItem}
                onClose={() => {
                  setIsEditDialogOpen(false)
                  setSelectedItem(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteItem}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}