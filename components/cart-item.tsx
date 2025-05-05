"use client"

import type React from "react"

import type { CartItem as CartItemType } from "@/contexts/cart-context"
import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

type CartItemProps = {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, updateNotes } = useCart()
  const { t } = useLanguage()
  const [showNotes, setShowNotes] = useState(!!item.notes)

  const handleIncrement = () => {
    updateQuantity(item.item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.item.id, item.quantity - 1)
    } else {
      removeItem(item.item.id)
    }
  }

  const handleRemove = () => {
    removeItem(item.item.id)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNotes(item.item.id, e.target.value)
  }

  return (
    <div className="flex flex-col border-b border-border py-4">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
          <Image src={item.item.image || "/placeholder.svg"} alt={item.item.name} fill className="object-cover" />
        </div>

        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium">{item.item.name}</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-2">{formatPrice(item.item.price)}</p>

          <div className="flex items-center">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDecrement}>
              <Minus className="h-3 w-3" />
            </Button>

            <div className="w-10 text-center">{item.quantity}</div>

            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrement}>
              <Plus className="h-3 w-3" />
            </Button>

            <div className="ml-auto font-medium">{formatPrice(item.item.price * item.quantity)}</div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        {showNotes ? (
          <Textarea
            placeholder={t("app.addNotes")}
            className="text-sm"
            value={item.notes || ""}
            onChange={handleNotesChange}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setShowNotes(true)}
          >
            {t("app.addNotes")}
          </Button>
        )}
      </div>
    </div>
  )
}
