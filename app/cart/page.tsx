"use client"

import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { formatPrice } from "@/lib/utils"
import { CartItem } from "@/components/cart-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CartPage() {
  const { items, subtotal, roomOrTableNumber, setRoomOrTableNumber } = useCart()
  const { t } = useLanguage()
  const router = useRouter()
  const [error, setError] = useState("")

  const tax = 0 // Prices include tax
  const total = subtotal // Prices include tax

  const handleContinue = () => {
    if (!roomOrTableNumber) {
      setError(t("app.enterRoomOrTable"))
      return
    }

    router.push("/checkout")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Link href="/menu">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t("app.cart")}</h1>
        </div>
      </div>

      <div className="flex-1 p-4">
        {items.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              {items.map((item) => (
                <CartItem key={item.item.id} item={item} />
              ))}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                {t("app.roomNumber")} / {t("app.tableNumber")}
              </label>
              <Input
                type="text"
                placeholder={t("app.enterRoomOrTable")}
                value={roomOrTableNumber}
                onChange={(e) => {
                  setRoomOrTableNumber(e.target.value)
                  setError("")
                }}
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-destructive text-sm mt-1">{error}</p>}
            </div>

            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>{t("app.total")}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              className="mt-4 bg-restaurant-accent hover:bg-restaurant-accent/80"
              size="lg"
              onClick={handleContinue}
            >
              {t("app.continue")}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[60vh] text-center"
          >
            <ShoppingBag className="h-16 w-16 mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">{t("app.emptyCart")}</h2>
            <p className="text-muted-foreground mb-6">Add items from the menu to place an order</p>
            <Link href="/menu">
              <Button>{t("app.addItems")}</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
