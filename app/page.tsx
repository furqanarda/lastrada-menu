"use client"

import { useLanguage } from "@/contexts/language-context"
import { useAccess } from "@/contexts/access-context"
import { LanguageSelector } from "@/components/language-selector"
import { AccessGuard } from "@/components/access-guard"
import { motion } from "framer-motion"
import Image from "next/image"
import { Heart } from "lucide-react"

export default function Home() {
  const { isValidToken, isViewOnlyMode } = useAccess()

  // Allow access if user has a valid token OR is in view-only mode
  // If no valid token and not in view-only mode, AccessGuard will redirect to access denied
  return (
    <AccessGuard requireValidToken={!isViewOnlyMode} requireOpenHours={false}>
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#0f172a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo.png"
              alt="La Strada Restaurant"
              width={240}
              height={120}
              className="object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
            />
          </div>

          <LanguageSelector />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-gray-400 text-sm mt-16 flex items-center justify-center"
          >
            Made with <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" /> by Furkan ARDA
          </motion.div>
        </div>
      </motion.div>
    </div>
    </AccessGuard>
  )
}
