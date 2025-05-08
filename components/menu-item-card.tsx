"use client"

import type { MenuItem } from "@/types/menu"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Info, Star, Flame, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Allergen icons and names
const allergenInfo: Record<string, { icon: string; name: string }> = {
  gluten: { icon: "🌾", name: "Gluten" },
  dairy: { icon: "🥛", name: "Dairy" },
  nuts: { icon: "🥜", name: "Nuts" },
  eggs: { icon: "🥚", name: "Eggs" },
  fish: { icon: "🐟", name: "Fish" },
  shellfish: { icon: "🦐", name: "Shellfish" },
  soy: { icon: "🫘", name: "Soy" },
  wheat: { icon: "🌾", name: "Wheat" },
  alcohol: { icon: "🍸", name: "Alcohol" },
}

type MenuItemCardProps = {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart()
  const [imageError, setImageError] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(item.options?.[0]?.name || "")
  const [activeTab, setActiveTab] = useState<string>("details")

  const handleAddToCart = () => {
    if (item.options && item.options.length > 0) {
      setIsDialogOpen(true)
    } else {
      addItem(item)
    }
  }

  const handleAddWithOption = () => {
    const selectedOptionObj = item.options?.find((opt) => opt.name === selectedOption)
    if (selectedOptionObj) {
      const itemWithOption = {
        ...item,
        name: `${item.name} (${selectedOption})`,
        price: selectedOptionObj.price,
        weight: selectedOptionObj.size || item.weight,
      }
      addItem(itemWithOption)
      setIsDialogOpen(false)
    }
  }

  // Use a placeholder image that's guaranteed to work
  const placeholderImage = `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(item.name || "")}`

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="overflow-hidden bg-[#1a2234] border-[#2a3346] shadow-lg h-full">
          <div className="relative h-48 w-full">
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] text-white p-4 text-center">
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            ) : (
              <Image
                src={placeholderImage || "/placeholder.svg"}
                alt={item.name || ""}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            )}
            {item.weight && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl-md">
                {item.weight}
              </div>
            )}
            {item.isBestSeller && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-br-md flex items-center">
                <Flame className="h-3 w-3 mr-1" />
                <span>En Çok Satan</span>
              </div>
            )}
          </div>
          <CardContent className="p-4 flex flex-col h-[calc(100%-12rem)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-lg text-white flex items-center">
                  {item.name}
                  {item.reviews && item.reviews.length > 0 && (
                    <span className="ml-2 flex items-center text-sm text-yellow-400">
                      <Star className="h-3 w-3 fill-yellow-400 mr-1" />
                      {(item.reviews.reduce((acc, review) => acc + review.rating, 0) / item.reviews.length).toFixed(1)}
                    </span>
                  )}
                </h3>
                <div className="relative">
                  <p className="text-sm text-gray-300 line-clamp-2 mt-1 pr-6">{item.description}</p>
                  {((item.description?.length || 0) > 60 || item.allergens?.length || item.reviews?.length) && (
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="absolute right-0 top-0 text-blue-400 hover:text-blue-300"
                    >
                      <Info size={16} />
                    </button>
                  )}
                </div>
                {item.allergens && item.allergens.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <TooltipProvider>
                      {item.allergens.map((allergen) => (
                        <Tooltip key={allergen}>
                          <TooltipTrigger asChild>
                            <span className="text-xs bg-[#2a3346] text-gray-300 px-1 py-0.5 rounded">
                              {allergenInfo[allergen]?.icon || "⚠️"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>İçerir: {allergenInfo[allergen]?.name || allergen}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="font-bold text-lg text-blue-400">
                {item.options && item.options.length > 0
                  ? `${formatPrice(item.options[0].price)}`
                  : formatPrice(item.price)}
              </div>
              <Button
                size="sm"
                className="rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                onClick={handleAddToCart}
              >
                <Plus className="h-4 w-4 mr-1" />
                {item.options && item.options.length > 0 ? "Seç" : "Ekle"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1a2234] text-white border-[#2a3346] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center">
              {item.name}
              {item.isBestSeller && (
                <Badge variant="outline" className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 border-none">
                  <Flame className="h-3 w-3 mr-1" /> En Çok Satan
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-300">{item.description}</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#0f172a]">
              <TabsTrigger value="details" className="data-[state=active]:bg-blue-500">
                Detaylar
              </TabsTrigger>
              {item.allergens && item.allergens.length > 0 && (
                <TabsTrigger value="allergens" className="data-[state=active]:bg-blue-500">
                  Alerjenler
                </TabsTrigger>
              )}
              {item.reviews && item.reviews.length > 0 && (
                <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-500">
                  Yorumlar
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="details" className="py-4">
              {item.options && item.options.length > 0 ? (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-200">Seçenekler</h4>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
                    {item.options.map((option) => (
                      <div key={option.name} className="flex items-center justify-between bg-[#0f172a] p-3 rounded-md">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            id={option.name}
                            value={option.name}
                            className="border-blue-500 text-blue-500"
                          />
                          <Label htmlFor={option.name} className="text-white cursor-pointer">
                            {option.name}
                          </Label>
                        </div>
                        <span className="text-blue-400 font-medium">{formatPrice(option.price)}</span>
                      </div>
                    ))}
                  </RadioGroup>

                  <Button
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleAddWithOption}
                  >
                    Sepete Ekle
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-4">
                    {item.weight && <span className="block text-sm mb-2">Porsiyon: {item.weight}</span>}
                    {item.description}
                  </p>
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => {
                      addItem(item)
                      setIsDialogOpen(false)
                    }}
                  >
                    Sepete Ekle
                  </Button>
                </div>
              )}
            </TabsContent>

            {item.allergens && item.allergens.length > 0 && (
              <TabsContent value="allergens" className="py-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Alerjen Bilgisi</h4>
                  <p className="text-gray-300 text-sm mb-2">Bu üründe aşağıdaki alerjenler bulunmaktadır:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {item.allergens.map((allergen) => (
                      <div key={allergen} className="flex items-center p-2 bg-[#0f172a] rounded-md text-gray-200">
                        <span className="text-lg mr-2">{allergenInfo[allergen]?.icon || "⚠️"}</span>
                        <span>{allergenInfo[allergen]?.name || allergen}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-amber-400 text-xs mt-4 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Alerjiniz varsa lütfen sipariş vermeden önce personele bildiriniz.
                  </p>
                </div>
              </TabsContent>
            )}

            {item.reviews && item.reviews.length > 0 && (
              <TabsContent value="reviews" className="py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Müşteri Yorumları</h4>
                    <div className="flex items-center bg-[#0f172a] px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-white font-medium">
                        {(item.reviews.reduce((acc, review) => acc + review.rating, 0) / item.reviews.length).toFixed(
                          1,
                        )}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">({item.reviews.length})</span>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {item.reviews.map((review, index) => (
                      <div key={index} className="bg-[#0f172a] p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-white">{review.name}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-500"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{review.comment}</p>
                        {review.date && <p className="text-gray-500 text-xs mt-1">{review.date}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
