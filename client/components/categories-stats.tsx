import { UtensilsCrossed, Layers, Check, Star } from "lucide-react"

interface HeroSectionProps {
  totalItems: number
  totalCategories: number
  activeItems: number
  popularItems: number
}

export function HeroSection({ totalItems, totalCategories, activeItems, popularItems }: HeroSectionProps) {
  return (
    <div className="mb-8 rounded-lg bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome to Menu Manager</h1>
        <p className="text-muted-foreground">Manage, organize, and showcase your restaurant's delicious offerings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Items</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-foreground">{totalItems}</span>
        </div>

        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Categories</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-foreground">{totalCategories}</span>
        </div>

        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Active</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-foreground">{activeItems}</span>
        </div>

        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Popular</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-foreground">{popularItems}</span>
        </div>
      </div>
    </div>
  )
}
