export type Category = {
  id: string
  name: string
  nameKey: string
  items: number
}

export type MenuItem = {
  id: string
  name: string
  nameEn?: string
  nameEl?: string
  nameBg?: string
  description: string
  descriptionEn?: string
  descriptionEl?: string
  descriptionBg?: string
  weight: string
  price: number
  image: string
  category: string
  options?: {
    name: string
    price: number
    size?: string
  }[]
  subcategory?: string
  allergens?: string[]
  isBestSeller?: boolean
  reviews?: {
    name: string
    rating: number
    comment: string
    date?: string
  }[]
  pairingNumbers?: string
  pairingText?: string
  region?: string
  wineType?: string
  brand?: string
}

export type BeerCategory = "local" | "import"
export type SpiritCategory = "whisky" | "raki" | "gin" | "tequila" | "vodka" | "jagermeister"
export type DrinkCategory = "coffee" | "soft" | "fresh"
export type WineCategory = "red" | "white" | "rose"
