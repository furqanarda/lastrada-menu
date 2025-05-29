"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { MenuItem } from "@/types/menu"
import { useAccess } from "@/contexts/access-context"

// Define cart item type
export type CartItem = {
  item: MenuItem
  quantity: number
  notes?: string
}

// Define context type
type CartContextType = {
  items: CartItem[]
  addItem: (item: MenuItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateNotes: (itemId: string, notes: string) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  locationInfo: string
  isLoaded: boolean
  isViewOnlyMode: boolean
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  updateNotes: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  locationInfo: "",
  isLoaded: false,
  isViewOnlyMode: false
})

// Create provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const { locationData, isViewOnlyMode } = useAccess()

  // Load cart from localStorage on client side only (but not in view-only mode)
  useEffect(() => {
    // Only run on client-side and not in view-only mode
    if (typeof window === 'undefined' || isViewOnlyMode) return;
    
    const savedCart = localStorage.getItem("cart")

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }
    
    // Mark as loaded from localStorage
    setIsLoaded(true)
  }, [isViewOnlyMode])

  // Save cart to localStorage when it changes (but not in view-only mode)
  useEffect(() => {
    // Only save to localStorage after initial loading, when on client-side, and not in view-only mode
    if (!isLoaded || typeof window === 'undefined' || isViewOnlyMode) return;
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items, isLoaded, isViewOnlyMode])

  // Clear cart when switching to view-only mode
  useEffect(() => {
    if (isViewOnlyMode) {
      setItems([])
    }
  }, [isViewOnlyMode])

  // Add item to cart (disabled in view-only mode)
  const addItem = (item: MenuItem) => {
    if (isViewOnlyMode) return; // Don't allow adding items in view-only mode
    
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.item.id === item.id)

      if (existingItem) {
        return prevItems.map((i) => (i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      } else {
        return [...prevItems, { item, quantity: 1 }]
      }
    })
  }

  // Remove item from cart (disabled in view-only mode)
  const removeItem = (itemId: string) => {
    if (isViewOnlyMode) return; // Don't allow removing items in view-only mode
    setItems((prevItems) => prevItems.filter((i) => i.item.id !== itemId))
  }

  // Update quantity (disabled in view-only mode)
  const updateQuantity = (itemId: string, quantity: number) => {
    if (isViewOnlyMode) return; // Don't allow updating quantity in view-only mode
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((i) => (i.item.id === itemId ? { ...i, quantity } : i)))
  }

  // Update notes (disabled in view-only mode)
  const updateNotes = (itemId: string, notes: string) => {
    if (isViewOnlyMode) return; // Don't allow updating notes in view-only mode
    setItems((prevItems) => prevItems.map((i) => (i.item.id === itemId ? { ...i, notes } : i)))
  }

  // Clear cart (disabled in view-only mode)
  const clearCart = () => {
    if (isViewOnlyMode) return; // Don't allow clearing cart in view-only mode
    setItems([])
  }

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.item.price * item.quantity, 0)

  // Get location info
  const locationInfo = isViewOnlyMode 
    ? "View-Only Menu" 
    : (locationData ? locationData.name : "")

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        totalItems,
        subtotal,
        locationInfo,
        isLoaded,
        isViewOnlyMode,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext)
