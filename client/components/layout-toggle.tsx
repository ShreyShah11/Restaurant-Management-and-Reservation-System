"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

interface ViewToggleProps {
  currentView: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps): React.ReactElement {
  return (
    <div className="flex gap-2 bg-muted p-1 rounded-lg w-fit">
      <Button
        size="sm"
        variant={currentView === "grid" ? "default" : "ghost"}
        onClick={() => onViewChange("grid")}
        className="h-8 px-3 text-xs sm:text-sm"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="ml-1 hidden sm:inline">Grid</span>
      </Button>
      <Button
        size="sm"
        variant={currentView === "list" ? "default" : "ghost"}
        onClick={() => onViewChange("list")}
        className="h-8 px-3 text-xs sm:text-sm"
      >
        <List className="w-4 h-4" />
        <span className="ml-1 hidden sm:inline">List</span>
      </Button>
    </div>
  )
}
