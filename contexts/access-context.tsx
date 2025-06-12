"use client"

import React, { createContext, useContext, useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { TokenContext, TokenData } from "@/types/auth"
import { validateToken, getRestaurantHours, validateSession } from "@/lib/auth"

// Create context with default values
const AccessContext = createContext<TokenContext>({
  token: null,
  locationData: null,
  isValidToken: false,
  isLoading: true,
  isViewOnlyMode: false,
  validateToken: async () => false,
  clearToken: () => {},
})

// Internal provider component that uses useSearchParams
const AccessProviderInternal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<TokenData | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isViewOnlyMode, setIsViewOnlyMode] = useState<boolean>(false)
  const searchParams = useSearchParams()

  // Function to check if user should have view-only access
  const checkViewOnlyMode = (): boolean => {
    if (typeof window === 'undefined') return false
    
    // Check if this is the view-only domain access
    const hostname = window.location.hostname
    const isViewOnlyDomain = hostname === 'menu.theplazahoteledirne.com'
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    
    // Check for view-only parameter
    const viewOnlyParam = searchParams.get("viewonly") === "true"
    
    // If no token is present and it's the view-only domain, enable view-only mode
    const urlToken = searchParams.get("token")
    const storedToken = localStorage.getItem("accessToken")
    
    // Enable view-only mode if:
    // 1. Production domain without token, OR
    // 2. Localhost without token (for development testing), OR  
    // 3. Any domain with viewonly=true parameter
    if ((isViewOnlyDomain && !urlToken && !storedToken) || 
        (isLocalhost && !urlToken && !storedToken) ||
        viewOnlyParam) {
      return true
    }
    
    return false
  }

  // Function to validate a token
  const validateTokenAsync = async (tokenToValidate: string): Promise<boolean> => {
    const data = validateToken(tokenToValidate)
    if (data) {
      setToken(tokenToValidate)
      setLocationData(data)
      setIsValidToken(true)
      setIsViewOnlyMode(false) // Not in view-only mode when we have a valid token
      
      // Store token in localStorage for session persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem("accessToken", tokenToValidate)
      }
      
      return true
    } else {
      clearToken()
      return false
    }
  }

  // Function to clear token
  const clearToken = () => {
    setToken(null)
    setLocationData(null)
    setIsValidToken(false)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken")
    }
    
    // Check if we should enable view-only mode after clearing token
    const viewOnly = checkViewOnlyMode()
    setIsViewOnlyMode(viewOnly)
  }

  // Check for token on initial load
  useEffect(() => {
    const checkToken = async () => {
      setIsLoading(true)
      
      // Check if we have a valid session
      const sessionData = validateSession()
      if (sessionData) {
        // Use the location data from the session
        setToken(sessionData.permanentToken)
        setLocationData(sessionData.locationData)
        setIsValidToken(true)
        setIsViewOnlyMode(false)
      } else {
        // No valid session, check for view-only mode
        const viewOnly = checkViewOnlyMode()
        setIsViewOnlyMode(viewOnly)
      }
      
      setIsLoading(false)
    }

    checkToken()
    
    // Listen for session changes by checking periodically
    const interval = setInterval(checkToken, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [searchParams])

  // Watch for search parameter changes (like adding ?viewonly=true)
  useEffect(() => {
    const checkViewOnly = () => {
      // Only check view-only mode if we don't have a valid token
      if (!isValidToken) {
        const viewOnly = checkViewOnlyMode()
        setIsViewOnlyMode(viewOnly)
      }
    }

    checkViewOnly()
  }, [searchParams, isValidToken])

  return (
    <AccessContext.Provider
      value={{
        token,
        locationData,
        isValidToken,
        isLoading,
        isViewOnlyMode,
        validateToken: validateTokenAsync,
        clearToken,
      }}
    >
      {children}
    </AccessContext.Provider>
  )
}

// Loading fallback component
const AccessProviderFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AccessContext.Provider
      value={{
        token: null,
        locationData: null,
        isValidToken: false,
        isLoading: true,
        isViewOnlyMode: false,
        validateToken: async () => false,
        clearToken: () => {},
      }}
    >
      {children}
    </AccessContext.Provider>
  )
}

// Main provider component with Suspense boundary
export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<AccessProviderFallback>{children}</AccessProviderFallback>}>
      <AccessProviderInternal>{children}</AccessProviderInternal>
    </Suspense>
  )
}

// Custom hook to use the access context
export const useAccess = () => useContext(AccessContext)

// Hook for restaurant hours
export const useRestaurantHours = () => {
  const [hours, setHours] = useState(getRestaurantHours())

  useEffect(() => {
    // Update hours every minute
    const interval = setInterval(() => {
      setHours(getRestaurantHours())
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return hours
} 