"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type { TokenContext, TokenData } from "@/types/auth"
import { validateToken, getRestaurantHours } from "@/lib/auth"

// Create context with default values
const AccessContext = createContext<TokenContext>({
  token: null,
  locationData: null,
  isValidToken: false,
  isLoading: true,
  validateToken: async () => false,
  clearToken: () => {},
})

// Create provider component
export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<TokenData | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const searchParams = useSearchParams()

  // Function to validate a token
  const validateTokenAsync = async (tokenToValidate: string): Promise<boolean> => {
    const data = validateToken(tokenToValidate)
    if (data) {
      setToken(tokenToValidate)
      setLocationData(data)
      setIsValidToken(true)
      
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
  }

  // Check for token on initial load
  useEffect(() => {
    const checkToken = async () => {
      setIsLoading(true)
      
      // First check URL parameter
      const urlToken = searchParams.get("token")
      if (urlToken) {
        await validateTokenAsync(urlToken)
      } else {
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem("accessToken")
          if (storedToken) {
            await validateTokenAsync(storedToken)
          }
        }
      }
      
      setIsLoading(false)
    }

    checkToken()
  }, [searchParams])

  return (
    <AccessContext.Provider
      value={{
        token,
        locationData,
        isValidToken,
        isLoading,
        validateToken: validateTokenAsync,
        clearToken,
      }}
    >
      {children}
    </AccessContext.Provider>
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