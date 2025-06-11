"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { SessionContext, SessionData } from "@/types/auth"
import {
  createSession,
  validateSession,
  clearSession,
  hasRecentSessionExpiration,
  clearSessionExpiredMessage,
  getSessionTimeRemaining
} from "@/lib/auth"

// Create context with default values
const SessionContextProvider = createContext<SessionContext>({
  sessionToken: null,
  sessionData: null,
  isValidSession: false,
  isSessionExpired: false,
  hasSessionExpiredMessage: false,
  createSession: async () => false,
  validateSession: () => false,
  clearSession: () => {},
  dismissExpiredMessage: () => {},
})

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isValidSession, setIsValidSession] = useState<boolean>(false)
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false)
  const [hasSessionExpiredMessage, setHasSessionExpiredMessage] = useState<boolean>(false)

  // Function to clear session data
  const clearSessionData = useCallback(() => {
    setSessionToken(null)
    setSessionData(null)
    setIsValidSession(false)
    clearSession()
  }, [])

  // Function to create a new session from a permanent token
  const createSessionAsync = useCallback(async (permanentToken: string): Promise<boolean> => {
    const newSessionData = createSession(permanentToken)
    if (newSessionData) {
      setSessionToken(newSessionData.sessionToken)
      setSessionData(newSessionData)
      setIsValidSession(true)
      setIsSessionExpired(false)
      setHasSessionExpiredMessage(false)
      return true
    } else {
      clearSessionData()
      return false
    }
  }, [clearSessionData])

  // Function to validate current session
  const validateCurrentSession = useCallback((): boolean => {
    const currentSessionData = validateSession()
    if (currentSessionData) {
      setSessionToken(currentSessionData.sessionToken)
      setSessionData(currentSessionData)
      setIsValidSession(true)
      setIsSessionExpired(false)
      return true
    } else {
      clearSessionData()
      
      // Check if session recently expired
      const hasExpiredMessage = hasRecentSessionExpiration()
      if (hasExpiredMessage) {
        setIsSessionExpired(true)
        setHasSessionExpiredMessage(true)
      }
      
      return false
    }
  }, [clearSessionData])

  // Function to dismiss expired message
  const dismissExpiredMessage = useCallback(() => {
    setIsSessionExpired(false)
    setHasSessionExpiredMessage(false)
    clearSessionExpiredMessage()
  }, [])

  // Auto-validate session on load and set up periodic validation
  useEffect(() => {
    // Initial validation
    validateCurrentSession()

    // Set up periodic session validation every 30 seconds
    const interval = setInterval(() => {
      if (!validateCurrentSession()) {
        // Session might have expired, check for expiration message
        const hasExpiredMessage = hasRecentSessionExpiration()
        if (hasExpiredMessage && !isSessionExpired) {
          setIsSessionExpired(true)
          setHasSessionExpiredMessage(true)
        }
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [validateCurrentSession, isSessionExpired])

  // Auto-refresh page visibility to catch sessions that expire while tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, revalidate session
        validateCurrentSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [validateCurrentSession])

  return (
    <SessionContextProvider.Provider
      value={{
        sessionToken,
        sessionData,
        isValidSession,
        isSessionExpired,
        hasSessionExpiredMessage,
        createSession: createSessionAsync,
        validateSession: validateCurrentSession,
        clearSession: clearSessionData,
        dismissExpiredMessage,
      }}
    >
      {children}
    </SessionContextProvider.Provider>
  )
}

// Custom hook to use the session context
export const useSession = () => useContext(SessionContextProvider)

// Hook to get session time remaining (updates every minute)
export const useSessionTimeRemaining = (): number => {
  const { isValidSession } = useSession()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  useEffect(() => {
    if (!isValidSession) {
      setTimeRemaining(0)
      return
    }

    // Update time remaining immediately
    const updateTimeRemaining = () => {
      const remaining = getSessionTimeRemaining()
      setTimeRemaining(remaining)
    }

    updateTimeRemaining()

    // Update every minute
    const interval = setInterval(updateTimeRemaining, 60000)
    return () => clearInterval(interval)
  }, [isValidSession])

  return timeRemaining
} 