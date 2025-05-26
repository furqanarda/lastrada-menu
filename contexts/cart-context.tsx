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

// Define cart context type
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
  isLoaded: false
})

// Create provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const { locationData } = useAccess()

  // Load cart from localStorage on client side only
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
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
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    // Only save to localStorage after initial loading and when on client-side
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items, isLoaded])

  // Add item to cart
  const addItem = (item: MenuItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.item.id === item.id)

      if (existingItem) {
        return prevItems.map((i) => (i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      } else {
        return [...prevItems, { item, quantity: 1 }]
      }
    })
  }

  // Remove item from cart
  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.item.id !== itemId))
  }

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((i) => (i.item.id === itemId ? { ...i, quantity } : i)))
  }

  // Update item notes
  const updateNotes = (itemId: string, notes: string) => {
    setItems((prevItems) => prevItems.map((i) => (i.item.id === itemId ? { ...i, notes } : i)))
  }

  // Clear cart
  const clearCart = () => {
    setItems([])
  }

  // Calculate total items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + item.item.price * item.quantity, 0)

  // Get location info from access context
  const locationInfo = locationData ? locationData.name : ""

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
        isLoaded
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext)
