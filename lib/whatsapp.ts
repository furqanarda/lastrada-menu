import type { CartItem } from "@/contexts/cart-context"
import { formatPrice } from "./utils"

export async function sendOrderToWhatsApp(
  items: CartItem[],
  roomOrTableNumber: string,
  subtotal: number,
  tax: number,
  total: number,
): Promise<string> {
  // Format the order message
  let message = `*New Order from La Strada Restaurant*\n\n`

  // Add room or table number
  message += `*Room/Table:* ${roomOrTableNumber}\n\n`

  // Add items
  message += `*Order Items:*\n`
  items.forEach((item) => {
    message += `- ${item.quantity}x ${item.item.name} (${formatPrice(item.item.price * item.quantity)})\n`
    if (item.notes) {
      message += `  Note: ${item.notes}\n`
    }
  })

  // Add totals
  message += `\n*Subtotal:* ${formatPrice(subtotal)}\n`
  message += `*Tax:* ${formatPrice(tax)}\n`
  message += `*Total:* ${formatPrice(total)}\n`

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message)

  // WhatsApp API URL
  const whatsappUrl = `https://wa.me/905321640422?text=${encodedMessage}`

  return whatsappUrl
}
