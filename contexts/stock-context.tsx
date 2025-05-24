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
  }, [])

  // Save stock status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("laStradaStock", JSON.stringify(stockStatus))
  }, [stockStatus])

  const toggleItemAvailability = (itemId: string) => {
    setStockStatus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
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