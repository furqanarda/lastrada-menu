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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
            className="mt-20 relative"
          >
            {/* Decorative line */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            
            {/* Main footer content */}
            <div className="relative backdrop-blur-sm bg-gradient-to-r from-slate-800/20 via-slate-700/30 to-slate-800/20 rounded-2xl border border-slate-600/30 p-6 shadow-2xl">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
              
              <div className="relative flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-300 font-light tracking-wide">Crafted with</span>
                <div className="relative">
                  <Heart className="h-4 w-4 text-red-400 animate-pulse drop-shadow-sm" />
                  <div className="absolute inset-0 h-4 w-4 text-red-400/30 animate-ping"></div>
                </div>
                <span className="text-gray-300 font-light tracking-wide">by</span>
                
                <a
                  href="https://compassintelligence.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center ml-1 group cursor-pointer"
                >
                  <div className="relative transform group-hover:scale-105 transition-all duration-300 ease-out">
                    <Image
                      src="/images/logos/compass_logo.png"
                      alt="Compass Intelligence"
                      width={95}
                      height={20}
                      className="object-contain brightness-90 contrast-110 group-hover:brightness-100 group-hover:contrast-100 transition-all duration-300 drop-shadow-sm"
                      style={{
                        filter: 'grayscale(0.2) opacity(0.95)'
                      }}
                    />
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
    </AccessGuard>
  )
}
