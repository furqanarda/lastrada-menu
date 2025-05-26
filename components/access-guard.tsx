"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAccess, useRestaurantHours } from "@/contexts/access-context"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Loader2, Clock, Shield } from "lucide-react"
import Image from "next/image"

interface AccessGuardProps {
  children: React.ReactNode
  requireValidToken?: boolean
  requireOpenHours?: boolean
}

export const AccessGuard: React.FC<AccessGuardProps> = ({ 
  children, 
  requireValidToken = true, 
  requireOpenHours = true 
}) => {
  const { isValidToken, isLoading } = useAccess()
  const restaurantHours = useRestaurantHours()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    // Don't redirect during loading
    if (isLoading) return

    // Don't protect admin or access-denied pages
    if (pathname.startsWith('/admin') || pathname === '/access-denied') return

    // Check token validation
    if (requireValidToken && !isValidToken) {
      router.push('/access-denied')
      return
    }

    // Check restaurant hours (only if token is valid)
    if (requireOpenHours && isValidToken && !restaurantHours.isOpen) {
      // Don't redirect, just show closed message
      return
    }
  }, [isValidToken, isLoading, restaurantHours.isOpen, router, pathname, requireValidToken, requireOpenHours])

  // Show loading screen
  if (isLoading) {
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
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-400 animate-spin" />
            <h1 className="text-xl font-bold text-blue-400 mb-2">
              {t("app.verifyingAccess")}
            </h1>
            <p className="text-gray-300">
              {t("app.pleaseWait")}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Don't protect admin or access-denied pages
  if (pathname.startsWith('/admin') || pathname === '/access-denied') {
    return <>{children}</>
  }

  // Check token validation
  if (requireValidToken && !isValidToken) {
    // Will redirect in useEffect, show nothing for now
    return null
  }

  // Check restaurant hours (only show closed screen if token is valid)
  if (requireOpenHours && isValidToken && !restaurantHours.isOpen) {
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

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-6">
            <Clock className="h-16 w-16 mx-auto mb-4 text-amber-400" />
            <h1 className="text-xl font-bold text-amber-400 mb-2">
              {t("app.restaurantClosed")}
            </h1>
            <p className="text-gray-300">
              {t("app.restaurantHours")}: {restaurantHours.openTime} - {restaurantHours.closeTime}
            </p>
          </div>

          <div className="bg-secondary/30 rounded-lg p-6">
            <div className="space-y-3 text-left">
              <p className="text-gray-300 text-sm">
                🇹🇷 Restoranımız şu anda kapalı. Servis saatleri: {restaurantHours.openTime} - {restaurantHours.closeTime}
              </p>
              <p className="text-gray-300 text-sm">
                🇺🇸 Our restaurant is currently closed. Service hours: {restaurantHours.openTime} - {restaurantHours.closeTime}
              </p>
              <p className="text-gray-300 text-sm">
                🇧🇬 Нашият ресторант в момента е затворен. Работно време: {restaurantHours.openTime} - {restaurantHours.closeTime}
              </p>
              <p className="text-gray-300 text-sm">
                🇬🇷 Το εστιατόριό μας είναι κλειστό αυτή τη στιγμή. Ώρες λειτουργίας: {restaurantHours.openTime} - {restaurantHours.closeTime}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Allow access
  return <>{children}</>
} 