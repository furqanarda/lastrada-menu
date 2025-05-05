"use client"

import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { formatPrice, generateOrderNumber, formatDate } from "@/lib/utils"
import { sendOrderToWhatsApp } from "@/lib/whatsapp"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CheckoutPage() {
  const { items, subtotal, roomOrTableNumber, clearCart } = useCart()
  const { t } = useLanguage()
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")
  const [orderTime, setOrderTime] = useState<Date>(new Date())
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0 && !isComplete) {
      router.push("/cart")
    }
  }, [items.length, router, isComplete])

  const handleProcessOrder = async () => {
    setIsProcessing(true)

    try {
      // Generate order details
      const number = generateOrderNumber()
      const time = new Date()
      setOrderNumber(number)
      setOrderTime(time)

      // Send order to WhatsApp
      const whatsappUrl = await sendOrderToWhatsApp(items, roomOrTableNumber, subtotal, tax, total)

      // Mark as complete
      setIsComplete(true)

      // Clear cart after successful order
      clearCart()

      // Open WhatsApp
      window.open(whatsappUrl, "_blank")
    } catch (error) {
      console.error("Error processing order:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewOrder = () => {
    router.push("/menu")
  }

  if (isComplete) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
          <h1 className="text-xl font-bold text-center">{t("app.orderConfirmation")}</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 p-6 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">{t("app.orderSent")}</h2>
          <p className="text-muted-foreground mb-8">Your order has been sent to WhatsApp</p>

          <div className="w-full max-w-md bg-secondary/50 rounded-lg p-6 mb-8">
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">{t("app.orderNumber")}</span>
              <span className="font-medium">{orderNumber}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">{t("app.orderTime")}</span>
              <span className="font-medium">{formatDate(orderTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("app.orderTotal")}</span>
              <span className="font-bold">{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            className="w-full max-w-md bg-restaurant-accent hover:bg-restaurant-accent/80"
            size="lg"
            onClick={handleNewOrder}
          >
            {t("app.newOrder")}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t("app.orderSummary")}</h1>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-4">
            <h2 className="font-medium mb-2">
              {t("app.roomNumber")} / {t("app.tableNumber")}
            </h2>
            <p className="text-lg">{roomOrTableNumber}</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-medium">{t("app.orderSummary")}</h2>

            {items.map((item) => (
              <div key={item.item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.quantity}x</span>
                  <span>{item.item.name}</span>
                </div>
                <span>{formatPrice(item.item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("app.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("app.tax")} (8%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>{t("app.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-restaurant-accent hover:bg-restaurant-accent/80"
            size="lg"
            onClick={handleProcessOrder}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : t("app.processOrder")}
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-2">Your order will be sent to WhatsApp</p>
        </div>
      </div>
    </div>
  )
}
