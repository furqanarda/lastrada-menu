"use client"

import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { AccessGuard } from "@/components/access-guard"
import { formatPrice, generateOrderNumber, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface PrintResult {
  printer: string;
  success: boolean;
  name?: string; // For friendly name
}

const printerNameMapping: { [key: string]: string } = {
  "192.168.1.50": "Bar Printer",
  "192.168.1.51": "Kitchen Printer",
  "192.168.1.52": "Reception Printer",
};

export default function CheckoutPage() {
  const { items, subtotal, locationInfo, clearCart } = useCart()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")
  const [orderTime, setOrderTime] = useState<Date>(new Date())
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [printJobDetails, setPrintJobDetails] = useState<PrintResult[]>([])
  const [orderProcessingError, setOrderProcessingError] = useState<string | null>(null)
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState<number>(0)
  const [customerEmail, setCustomerEmail] = useState("")

  const tax = 0 // Prices include tax
  const total = subtotal // subtotal from cart is now the final total

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0 && !isComplete) {
      router.push("/cart")
    }
  }, [items.length, router, isComplete])

  const handleProcessOrder = async () => {
    const currentOrderTotalValue = total; // Capture total at the moment of processing
    const number = generateOrderNumber(); // Generate order number at the start
    const time = new Date();             // Generate order time at the start

    setIsProcessing(true);
    setOrderNumber(number); // Set state for UI before async operation if needed elsewhere, or can be set later
    setOrderTime(time);     // Set state for UI before async operation if needed elsewhere, or can be set later

    try {
      // Determine Print Service URL
      let printServiceUrl = "https://menu.theplazahoteledirne.com/print"; // Default for production

      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        if (hostname === "localhost") {
          // Local development
          printServiceUrl = "http://localhost:3001/print";
        }
        else if (hostname.startsWith("192.168.1.")) {
          // Local network IP access
          printServiceUrl = `http://${hostname}:3001/print`;
        }
        else if (hostname === "menu.theplazahoteledirne.com" || hostname === "theplazahoteledirne.com") {
          // Use HTTPS and relative route through NGINX reverse proxy
          printServiceUrl = `${protocol}//${hostname}/print`;
        }
      }

      const orderPayload = {
        orderNumber: number, // Use generated number
        orderTime: time.toISOString(), // Use generated time
        locationInfo,
        roomOrTableNumber: locationInfo, // For backward compatibility with print service
        customerEmail: customerEmail.trim() || null, // Include customer email if provided
        customerLanguage: language, // Include customer's language preference
        items: items.map(cartItem => ({
          id: cartItem.item.id,
          nameKey: cartItem.item.nameKey,
          quantity: cartItem.quantity,
          price: cartItem.item.price, // Assuming item.price is already tax-inclusive
          notes: cartItem.notes,
          // category: cartItem.item.category, // Retained for potential future use
        })),
        subtotal: currentOrderTotalValue, // Use captured total for payload
        tax: 0,
        total: currentOrderTotalValue,    // Use captured total for payload
      }

      const response = await fetch(printServiceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer LA_STRADA_PRINT_SUPER_SECRET_TOKEN_123!`
        },
        body: JSON.stringify(orderPayload),
      })

      const responseData = await response.json() // Always try to parse JSON

      if (response.ok) { // status 200-299
        console.log("Order sent to print service successfully", responseData)
        if (response.status === 207 && responseData.results) {
          // Partial success, some printers might have failed
          const detailedResults = responseData.results.map((r: PrintResult) => ({
            ...r,
            name: printerNameMapping[r.printer] || r.printer,
          }))
          setPrintJobDetails(detailedResults)
          // Check if all actual print jobs in results failed, to set a more general error
          const allIndividualPrintsFailed = detailedResults.every((r: PrintResult) => !r.success)
          if (allIndividualPrintsFailed) {
            setOrderProcessingError(t('ui.order.print_error_all_printers') || "Order processed, but all printers failed. Please contact staff immediately.")
          } else if (detailedResults.some((r: PrintResult) => !r.success)) {
            // Some printers failed, specific messages will be shown via printJobDetails
            setOrderProcessingError(t('ui.order.print_error_some_printers') || "Order processed, but some printers failed. Please check details or contact staff.")
          }
        } else {
          // Full success (status 200)
          setPrintJobDetails([]) // Clear any previous details
          setOrderProcessingError(null)
        }

        setConfirmedOrderTotal(currentOrderTotalValue); // Set the captured total for confirmation screen
        // OrderNumber and OrderTime are already set from the beginning of the function
        setIsComplete(true); // Now, mark as complete to show confirmation screen
        clearCart(); // Finally, clear the cart

      } else {
        // Handle non-ok responses (4xx, 5xx)
        console.error("Error sending order to print service:", response.status, responseData)
        const message = responseData.message || `Print service failed: ${response.status}`
        setOrderProcessingError(message)
        setIsComplete(false) // Don't show success screen if the request itself failed badly
        setIsProcessing(false)
        return // Stop further processing in the try block
      }

    } catch (error: any) {
      console.error("Error processing order:", error)
      setOrderProcessingError(error.message || t('ui.order.print_error_generic') || "An unexpected error occurred. Please try again or contact staff.")
      setIsComplete(false) // Ensure success screen isn't shown on catch
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewOrder = () => {
    router.push("/menu")
  }

  if (isComplete) {
    return (
      <AccessGuard requireValidToken={true} requireOpenHours={true}>
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
          {/* Display general success or specific error message */}
          {orderProcessingError ? (
            <p className="text-red-500 mb-4">{orderProcessingError}</p>
          ) : (
            <p className="text-muted-foreground mb-4">{t("ui.order.print_success")}</p>
          )}

          {/* Display individual printer statuses if available */}
          {printJobDetails && printJobDetails.length > 0 && (
            <div className="w-full max-w-md bg-secondary/30 rounded-lg p-4 my-4 text-sm">
              <h3 className="font-medium mb-2">Printer Status:</h3>
              {printJobDetails.map((result) => (
                <div key={result.printer} className={`flex justify-between py-1 ${result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                  <span>{result.name}:</span>
                  <span>{result.success ? "Success" : "Failed"}</span>
                </div>
              ))}
            </div>
          )}

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
              <span className="font-bold">{formatPrice(confirmedOrderTotal)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-restaurant-accent hover:bg-restaurant-accent/80"
            size="lg"
            onClick={handleNewOrder}
          >
            {t("app.newOrder")}
          </Button>
        </motion.div>
      </div>
      </AccessGuard>
    )
  }

  return (
    <AccessGuard requireValidToken={true} requireOpenHours={true}>
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
            <p className="text-lg">{locationInfo}</p>
          </div>

          <div className="bg-secondary/30 rounded-lg p-4">
            <label htmlFor="customer-email" className="text-sm font-medium mb-2 block text-gray-300">
              {t("app.customerEmail")} ({t("app.optional")})
            </label>
            <Input
              id="customer-email"
              type="email"
              placeholder={t("app.customerEmailPlaceholder")}
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="bg-background border-border text-white"
            />
            <p className="text-xs text-gray-400 mt-2">{t("app.emailNotification")}</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-medium">{t("app.orderSummary")}</h2>

            {items.map((item) => (
              <div key={item.item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.quantity}x</span>
                  <span>{t(item.item.nameKey || "")}</span>
                </div>
                <span>{formatPrice(item.item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2">
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
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("app.processOrder")
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-2">{t("ui.order.print_note")}</p>
        </div>
      </div>
    </div>
    </AccessGuard>
  )
}
