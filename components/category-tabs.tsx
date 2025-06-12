"use client"

import { useLanguage } from "@/contexts/language-context"
import { useAccess } from "@/contexts/access-context"
import { isCategoryAvailable } from "@/lib/auth"
import type { Category } from "@/types/menu"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import {
  Coffee,
  UtensilsCrossed,
  Soup,
  Salad,
  Beef,
  Sandwich,
  Cake,
  Wine,
  Beer,
  GlassWater,
  LayoutGrid,
  CoffeeIcon as Cocktail,
  Sparkles,
  Utensils,
  Clock
} from "lucide-react"

type CategoryTabsProps = {
  categories: Category[]
  activeCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function CategoryTabs({ categories, activeCategory, onSelectCategory }: CategoryTabsProps) {
  const { t } = useLanguage()
  const { isViewOnlyMode } = useAccess()

  // Function to get the appropriate icon for each category
  const getCategoryIcon = (categoryId: string) => {
    const iconProps = { className: "h-4 w-4 mr-2" }

    switch (categoryId) {
      case "all":
        return <LayoutGrid {...iconProps} />
      case "breakfast":
        return <Coffee {...iconProps} />
      case "starters":
        return <Soup {...iconProps} />
      case "salads":
        return <Salad {...iconProps} />
      case "main-dishes":
        return <Beef {...iconProps} />
      case "pasta":
        return <Utensils {...iconProps} /> // Changed from Pizza to Utensils for pasta
      case "burgers":
        return <Sandwich {...iconProps} />
      case "desserts":
        return <Cake {...iconProps} />
      case "drinks":
        return <GlassWater {...iconProps} />
      case "cocktails":
        return <Cocktail {...iconProps} />
      case "beers":
        return <Beer {...iconProps} />
      case "wines":
        return <Wine {...iconProps} />
      case "spirits":
        return <Wine {...iconProps} />
      case "extras":
        return <Sparkles {...iconProps} />
      default:
        return <UtensilsCrossed {...iconProps} />
    }
  }

  // Check if a category is currently available (only for QR access)
  const isCategoryCurrentlyAvailable = (categoryId: string) => {
    // In view-only mode, all categories are always available
    if (isViewOnlyMode) return true
    
    // "all" category should be available if any category is available
    if (categoryId === "all") return true
    
    return isCategoryAvailable(categoryId)
  }

  return (
    <div className="sticky top-[130px] z-10 bg-[#0f172a] border-b border-[#2a3346]">
      <ScrollArea className="w-full whitespace-nowrap bg-[#1a2234]">
        <div className="flex space-x-2 p-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            const isAvailable = isCategoryCurrentlyAvailable(category.id)
            
            return (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => isAvailable && onSelectCategory(category.id)}
                disabled={!isAvailable}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && isAvailable
                    ? "bg-blue-500 text-white"
                    : isAvailable
                    ? "bg-[#2a3346] text-gray-200 hover:bg-[#374151]"
                    : "bg-[#1a1a1a] text-gray-500 cursor-not-allowed opacity-60",
                )}
              >
                {isAvailable ? (
                  getCategoryIcon(category.id)
                ) : (
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                )}
                <span>
                  {t(category.nameKey)}
                </span>
                <span className="ml-2 text-xs rounded-full bg-black/30 px-1.5 py-0.5">
                  {category.items}
                </span>
              </motion.button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
