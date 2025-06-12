"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "@/contexts/session-context"
import { validateToken, createSession as createSessionUtil, validateSession as validateSessionUtil } from "@/lib/auth"
import SessionExpired from "./session-expired"

interface SessionGuardProps {
  children: React.ReactNode
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSessionExpired, hasSessionExpiredMessage, dismissExpiredMessage } = useSession()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeSession = async () => {
      // Check for QR token in URL
      const urlToken = searchParams.get("token")
      
      if (urlToken) {
        // QR code was scanned - validate the permanent token and create a new session
        const tokenData = validateToken(urlToken)
        if (tokenData) {
          // Create a new session for this permanent token using the utility function
          createSessionUtil(urlToken)
        }
      } else {
        // No QR token in URL - check if we have a valid existing session
        validateSessionUtil()
      }
      
      setIsInitialized(true)
    }

    // Only run once on mount or when URL token changes
    initializeSession()
  }, [searchParams])

  // Handle session expiration dismissal
  const handleSessionExpiredDismiss = () => {
    dismissExpiredMessage()
    // Redirect to view-only mode instead of access-denied
    router.push("/?viewonly=true")
  }

  // Show session expired message if session has expired
  if (isInitialized && (isSessionExpired || hasSessionExpiredMessage)) {
    return (
      <SessionExpired 
        onDismiss={handleSessionExpiredDismiss}
      />
    )
  }

  // Show loading until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Continue with normal flow - let AccessProvider handle the rest
  return <>{children}</>
} 