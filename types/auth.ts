export type LocationType = "room" | "restaurant" | "garden"

export interface TokenData {
  token: string
  type: LocationType
  location: string
  name: string
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
  openTime: string // "12:00"
  closeTime: string // "00:00"
} 