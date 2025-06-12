"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type StockContextType = {
  stockStatus: Record<string, boolean>
  toggleItemAvailability: (itemId: string) => void
  isItemAvailable: (itemId: string) => boolean
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: ReactNode }) {
  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load stock status from localStorage on mount
  useEffect(() => {
    const savedStock = localStorage.getItem("laStradaStock")
    if (savedStock) {
      try {
        setStockStatus(JSON.parse(savedStock))
      } catch (error) {
        console.error("Error loading stock status:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save stock status to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("laStradaStock", JSON.stringify(stockStatus))
    }
  }, [stockStatus, isLoaded])

  const toggleItemAvailability = (itemId: string) => {
    setStockStatus(prev => {
      const currentValue = prev[itemId] !== false // Default to true if not set
      return {
        ...prev,
        [itemId]: !currentValue
      }
    })
  }

  const isItemAvailable = (itemId: string) => {
    // Default to available if not set
    return stockStatus[itemId] !== false
  }

  return (
    <StockContext.Provider value={{ stockStatus, toggleItemAvailability, isItemAvailable }}>
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext)
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider")
  }
  return context
} 