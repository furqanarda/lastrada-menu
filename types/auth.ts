export type LocationType = "room" | "restaurant" | "garden"

export interface TokenData {
  token: string
  type: LocationType
  location: string
  name: string
}

// Session-related interfaces
export interface SessionData {
  sessionToken: string
  permanentToken: string // The original QR token
  locationData: TokenData
  createdAt: number // Unix timestamp
  expiresAt: number // Unix timestamp
}

export interface SessionContext {
  sessionToken: string | null
  sessionData: SessionData | null
  isValidSession: boolean
  isSessionExpired: boolean
  hasSessionExpiredMessage: boolean
  createSession: (permanentToken: string) => Promise<boolean>
  validateSession: () => boolean
  clearSession: () => void
  dismissExpiredMessage: () => void
}

export interface TokenContext {
  token: string | null
  locationData: TokenData | null
  isValidToken: boolean
  isLoading: boolean
  isViewOnlyMode: boolean
  validateToken: (token: string) => Promise<boolean>
  clearToken: () => void
}

export interface RestaurantHours {
  isOpen: boolean
  openTime: string // "07:00"
  closeTime: string // "00:00"
}

export interface DetailedRestaurantStatus {
  isBreakfastTime: boolean
  isRegularTime: boolean
  isClosed: boolean
  isBreakfastAvailable: boolean
  isRegularMenuAvailable: boolean
  currentTimeInMinutes: number
  breakfastHours: string
  regularHours: string
} 