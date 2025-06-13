"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type StockContextType = {
  stockStatus: Record<string, boolean>
  toggleItemAvailability: (itemId: string) => void
  isItemAvailable: (itemId: string) => boolean
  isLoading: boolean
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: ReactNode }) {
  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load stock status from API on mount and refresh periodically
  useEffect(() => {
    loadStockStatus()
    
    // Refresh stock status every 30 seconds to keep all devices in sync
    const intervalId = setInterval(loadStockStatus, 30000)
    
    return () => clearInterval(intervalId)
  }, [])

  const loadStockStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stock')
      if (response.ok) {
        const data = await response.json()
        setStockStatus(data.stockStatus || {})
      } else {
        console.error('Failed to load stock status')
      }
    } catch (error) {
      console.error('Error loading stock status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemAvailability = async (itemId: string) => {
    const currentValue = stockStatus[itemId] !== false // Default to true if not set
    const newValue = !currentValue

    // Optimistically update UI
    setStockStatus(prev => ({
      ...prev,
      [itemId]: newValue
    }))

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          isAvailable: newValue
        })
      })

      if (response.ok) {
        const data = await response.json()
        setStockStatus(data.stockStatus || {})
      } else {
        // Revert optimistic update on failure
        setStockStatus(prev => ({
          ...prev,
          [itemId]: currentValue
        }))
        console.error('Failed to update stock status')
      }
    } catch (error) {
      // Revert optimistic update on failure
      setStockStatus(prev => ({
        ...prev,
        [itemId]: currentValue
      }))
      console.error('Error updating stock status:', error)
    }
  }

  const isItemAvailable = (itemId: string) => {
    // Default to available if not set
    return stockStatus[itemId] !== false
  }

  return (
    <StockContext.Provider value={{ stockStatus, toggleItemAvailability, isItemAvailable, isLoading }}>
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