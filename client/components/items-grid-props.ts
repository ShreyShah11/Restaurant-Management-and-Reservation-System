import type { Item } from "@/store/restaurant"

export interface ItemsGridProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}
