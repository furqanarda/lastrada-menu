"use client"

import { Clock } from "lucide-react"
import { motion } from "framer-motion"

export function RestaurantClosed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 m-4"
    >
      <div className="flex items-center justify-center mb-4">
        <Clock className="h-8 w-8 text-yellow-500" />
      </div>
      
      <div className="space-y-4 text-center">
        <p className="text-yellow-400 font-medium">
          🇹🇷 Mutfak şu anda kapalıdır. Sipariş saatleri her gün 12:00 - 00:00 arasıdır.
        </p>
        <p className="text-yellow-400 font-medium">
          🇺🇸 The kitchen is currently closed. Orders can be made between 12:00 PM and 12:00 AM.
        </p>
        <p className="text-yellow-400 font-medium">
          🇧🇬 Кухнята в момента е затворена. Поръчките се приемат всеки ден между 12:00 и 00:00.
        </p>
        <p className="text-yellow-400 font-medium">
          🇬🇷 Η κουζίνα είναι προσωρινά κλειστή. Οι παραγγελίες γίνονται καθημερινά 12:00 - 00:00.
        </p>
      </div>
    </motion.div>
  )
} 