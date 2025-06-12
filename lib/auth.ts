import { TokenData, RestaurantHours, SessionData } from "@/types/auth"
import tokensData from "@/data/tokens.json"

// Convert the JSON data to a more efficient lookup structure
const tokenLookup = new Map<string, TokenData>()
Object.values(tokensData as Record<string, TokenData>).forEach((data) => {
  tokenLookup.set(data.token, data)
})

// Session configuration
const SESSION_DURATION_MINUTES = 15
const SESSION_DURATION_MS = SESSION_DURATION_MINUTES * 60 * 1000 // 15 minutes in milliseconds
const SESSION_STORAGE_KEY = 'menuSessionData'
const SESSION_EXPIRED_MESSAGE_KEY = 'sessionExpiredMessageShown'

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
 * Generates a unique session token
 */
export function generateSessionToken(permanentToken: string): string {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 15)
  // Create a session token that includes the location for easier debugging
  const locationData = validateToken(permanentToken)
  const locationPart = locationData ? locationData.location.toLowerCase().replace(/\s+/g, '-') : 'unknown'
  return `session-${locationPart}-${timestamp}-${randomPart}`
}

/**
 * Creates a new session for a permanent token
 */
export function createSession(permanentToken: string): SessionData | null {
  const locationData = validateToken(permanentToken)
  if (!locationData) {
    return null
  }

  const now = Date.now()
  const sessionToken = generateSessionToken(permanentToken)
  
  const sessionData: SessionData = {
    sessionToken,
    permanentToken,
    locationData,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS
  }

  // Store session in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
    // Clear any previous expiration message
    localStorage.removeItem(SESSION_EXPIRED_MESSAGE_KEY)
  }

  return sessionData
}

/**
 * Validates and retrieves current session
 */
export function validateSession(): SessionData | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const sessionDataStr = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!sessionDataStr) {
      return null
    }

    const sessionData: SessionData = JSON.parse(sessionDataStr)
    const now = Date.now()

    // Check if session has expired
    if (now > sessionData.expiresAt) {
      // Mark that session has expired and clear it
      localStorage.setItem(SESSION_EXPIRED_MESSAGE_KEY, 'true')
      clearSession()
      return null
    }

    // Validate that the permanent token is still valid
    const locationData = validateToken(sessionData.permanentToken)
    if (!locationData) {
      clearSession()
      return null
    }

    // Update location data in case it has changed
    sessionData.locationData = locationData

    return sessionData
  } catch (error) {
    console.error('Error validating session:', error)
    clearSession()
    return null
  }
}

/**
 * Checks if a session has recently expired
 */
export function hasRecentSessionExpiration(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  return localStorage.getItem(SESSION_EXPIRED_MESSAGE_KEY) === 'true'
}

/**
 * Clears the session expired message flag
 */
export function clearSessionExpiredMessage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_EXPIRED_MESSAGE_KEY)
  }
}

/**
 * Clears the current session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
}

/**
 * Gets session expiration time remaining in minutes
 */
export function getSessionTimeRemaining(): number {
  const sessionData = validateSession()
  if (!sessionData) {
    return 0
  }

  const now = Date.now()
  const remainingMs = sessionData.expiresAt - now
  return Math.max(0, Math.floor(remainingMs / (60 * 1000))) // Convert to minutes
}

/**
 * Extends current session by the full duration (essentially refreshes it)
 */
export function refreshSession(): boolean {
  const sessionData = validateSession()
  if (!sessionData) {
    return false
  }

  const now = Date.now()
  sessionData.expiresAt = now + SESSION_DURATION_MS

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
  }

  return true
}

/**
 * Checks if the restaurant is currently open
 * Restaurant hours: 12:00 PM - 12:00 AM (24:00) daily
 * Breakfast hours: 07:00 AM - 12:00 PM daily
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
  
  // Breakfast hours: 07:00 AM (420 minutes) to 12:00 PM (720 minutes)
  const breakfastStartInMinutes = 7 * 60 // 07:00 AM = 420 minutes
  const breakfastEndInMinutes = 12 * 60 // 12:00 PM = 720 minutes
  
  // Check if current time is within operating hours (either breakfast or regular)
  const isRegularHours = currentTimeInMinutes >= openTimeInMinutes
  const isBreakfastHours = currentTimeInMinutes >= breakfastStartInMinutes && currentTimeInMinutes < breakfastEndInMinutes
  const isOpen = isRegularHours || isBreakfastHours
  
  return {
    isOpen,
    openTime: "07:00", // Updated to show earliest opening time
    closeTime: "00:00"
  }
}

/**
 * Checks if a specific category is available at the current time
 */
export function isCategoryAvailable(category: string): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute
  
  // Breakfast category: 07:00 - 00:00 (all day after 7 AM)
  if (category === "breakfast") {
    const breakfastStart = 7 * 60 // 07:00 AM
    return currentTimeInMinutes >= breakfastStart
  }
  
  // All other categories: 12:00 - 00:00 (next day)
  const regularStart = 12 * 60 // 12:00 PM
  return currentTimeInMinutes >= regularStart
}

/**
 * Gets detailed restaurant status with category-specific information
 */
export function getDetailedRestaurantStatus() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute
  
  const breakfastStart = 7 * 60 // 07:00 AM
  const regularStart = 12 * 60 // 12:00 PM
  const closeTime = 24 * 60 // 00:00 (next day)
  
  const isBreakfastTime = currentTimeInMinutes >= breakfastStart
  const isRegularTime = currentTimeInMinutes >= regularStart
  const isClosed = currentTimeInMinutes >= 0 && currentTimeInMinutes < breakfastStart
  
  return {
    isBreakfastTime,
    isRegularTime,
    isClosed,
    isBreakfastAvailable: isBreakfastTime,
    isRegularMenuAvailable: isRegularTime,
    currentTimeInMinutes,
    breakfastHours: "07:00 - 00:00",
    regularHours: "12:00 - 00:00"
  }
}

/**
 * Gets location data from token
 */
export function getLocationFromToken(token: string): TokenData | null {
  return validateToken(token)
} 