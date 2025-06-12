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
          🇹🇷 Mutfak şu anda kapalıdır. Kahvaltı: 07:00-12:00, Ana menü: 12:00-00:00
        </p>
        <p className="text-yellow-400 font-medium">
          🇺🇸 The kitchen is currently closed. Breakfast: 07:00AM-12:00PM, Main menu: 12:00PM-12:00AM
        </p>
        <p className="text-yellow-400 font-medium">
          🇧🇬 Кухнята в момента е затворена. Закуска: 07:00-12:00, Основно меню: 12:00-00:00
        </p>
        <p className="text-yellow-400 font-medium">
          🇬🇷 Η κουζίνα είναι προσωρινά κλειστή. Πρωινό: 07:00-12:00, Κυρίως μενού: 12:00-00:00
        </p>
      </div>
    </motion.div>
  )
} 