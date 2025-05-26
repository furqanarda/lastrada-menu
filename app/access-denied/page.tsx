"use client"

import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { motion } from "framer-motion"
import Image from "next/image"
import { Shield, QrCode } from "lucide-react"

export default function AccessDeniedPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#0f172a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo.png"
            alt="La Strada Restaurant"
            width={240}
            height={120}
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
            }}
          />
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-red-400 mb-2">
            {t("app.accessDenied")}
          </h1>
        </div>

        <div className="bg-secondary/30 rounded-lg p-6 mb-6">
          <QrCode className="h-12 w-12 mx-auto mb-4 text-blue-400" />
          <div className="space-y-4 text-left">
            <p className="text-gray-300">
              🇹🇷 Mutfak menüsüne sadece odanızda veya masanızda bulunan QR kod ile erişebilirsiniz.
            </p>
            <p className="text-gray-300">
              🇺🇸 This menu can only be accessed via the QR code provided in your room or on your table.
            </p>
            <p className="text-gray-300">
              🇧🇬 Това меню може да бъде достъпено само чрез QR кода, предоставен във вашата стая или на вашата маса.
            </p>
            <p className="text-gray-300">
              🇬🇷 Αυτό το μενού είναι προσβάσιμο μόνο μέσω του κωδικού QR που παρέχεται στο δωμάτιό σας ή στο τραπέζι σας.
            </p>
          </div>
        </div>

        <LanguageSelector />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-gray-400 text-sm mt-8"
        >
          {t("app.contactReception")}
        </motion.div>
      </motion.div>
    </div>
  )
} 