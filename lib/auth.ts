import { TokenData, RestaurantHours } from "@/types/auth"
import tokensData from "@/data/tokens.json"

// Convert the JSON data to a more efficient lookup structure
const tokenLookup = new Map<string, TokenData>()
Object.values(tokensData as Record<string, TokenData>).forEach((data) => {
  tokenLookup.set(data.token, data)
})

/**
 * Validates if a token exists in our token database
 */
export function validateToken(token: string): TokenData | null {
  return tokenLookup.get(token) || null
}

/**
 * Gets all valid tokens (for development/testing purposes)
 */
export function getAllTokens(): TokenData[] {
  return Object.values(tokensData as Record<string, TokenData>)
}

/**
 * Checks if the restaurant is currently open
 * Restaurant hours: 12:00 PM - 12:00 AM (24:00) daily
 */
export function getRestaurantHours(): RestaurantHours {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Convert current time to minutes since midnight
  const currentTimeInMinutes = currentHour * 60 + currentMinute
  
  // Restaurant hours: 12:00 PM (720 minutes) to 12:00 AM (1440 minutes = 0 next day)
  const openTimeInMinutes = 12 * 60 // 12:00 PM = 720 minutes
  const closeTimeInMinutes = 24 * 60 // 12:00 AM = 1440 minutes (next day)
  
  // Check if current time is within operating hours
  // Open from 12:00 PM to 11:59 PM (same day)
  const isOpen = currentTimeInMinutes >= openTimeInMinutes
  
  return {
    isOpen,
    openTime: "12:00",
    closeTime: "00:00"
  }
}

/**
 * Gets location data from token
 */
export function getLocationFromToken(token: string): TokenData | null {
  return validateToken(token)
} 