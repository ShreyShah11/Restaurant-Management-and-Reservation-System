"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Item } from "@/store/restaurant"
import { FOOD_TYPE_LABELS, FOOD_TYPE_COLORS } from "@/constants/food-types"

interface MenuPreviewProps {
  items: Item[]
}

interface GroupedItems {
  [key: string]: {
    cuisine: string
    category: string
    items: Item[]
  }
}

export function MenuPreview({ items }: MenuPreviewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const groupedItems: GroupedItems = items.reduce((acc: GroupedItems, item: Item) => {
    const key: string = `${item.cuisine}-${item.category}`
    if (!acc[key]) {
      acc[key] = { cuisine: item.cuisine, category: item.category, items: [] }
    }
    acc[key].items.push(item)
    return acc
  }, {})

  const cuisines: string[] = [...new Set(items.map((item: Item) => item.cuisine))]

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Total Items: {items.length}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            List
          </button>
        </div>
      </div>

      <Tabs defaultValue={cuisines[0]} className="w-full">
        <TabsList className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))` }}>
          {cuisines.map((cuisine: string) => (
            <TabsTrigger key={cuisine} value={cuisine} className="text-xs sm:text-sm">
              {cuisine}
            </TabsTrigger>
          ))}
        </TabsList>

        {cuisines.map((cuisine: string) => (
          <TabsContent key={cuisine} value={cuisine} className="space-y-6 mt-4">
            {Object.entries(groupedItems)
              .filter(([, group]) => group.cuisine === cuisine)
              .map(([key, group]) => (
                <div key={key}>
                  <h3 className="text-lg font-bold text-foreground mb-4">{group.category}</h3>
                  {viewMode === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {group.items.map((item: Item) => (
                        <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          {item.imageURL && (
                            <img
                              src={item.imageURL || "/placeholder.svg"}
                              alt={item.dishName}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{item.dishName}</h4>
                            <Badge className={FOOD_TYPE_COLORS[item.foodType] || "bg-gray-100 text-gray-800"}>
                              {FOOD_TYPE_LABELS[item.foodType]}
                            </Badge>
                          </div>
                          {item.description && <p className="text-xs text-muted-foreground mb-2">{item.description}</p>}
                          <div className="text-lg font-bold text-primary">₹{item.price.toFixed(0)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.items.map((item: Item) => (
                        <div
                          key={item._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow flex gap-4"
                        >
                          {item.imageURL && (
                            <img
                              src={item.imageURL || "/placeholder.svg"}
                              alt={item.dishName}
                              className="w-20 h-20 object-cover rounded shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <h4 className="font-semibold text-foreground">{item.dishName}</h4>
                              <Badge className={FOOD_TYPE_COLORS[item.foodType] || "bg-gray-100 text-gray-800"}>
                                {FOOD_TYPE_LABELS[item.foodType]}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                            )}
                            <div className="text-lg font-bold text-primary">₹{item.price.toFixed(0)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
