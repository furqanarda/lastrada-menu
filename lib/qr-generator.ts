import { getAllTokens } from "./auth"

/**
 * Generates a QR code URL for a given token
 */
export function generateQRCodeURL(token: string, baseURL: string = "https://menu.theplazahoteledirne.com"): string {
  return `${baseURL}?token=${encodeURIComponent(token)}`
}

/**
 * Gets all available tokens with their QR code URLs
 */
export function getAllQRCodes(baseURL: string = "https://menu.theplazahoteledirne.com") {
  const tokens = getAllTokens()
  
  return tokens.map(tokenData => ({
    ...tokenData,
    qrCodeURL: generateQRCodeURL(tokenData.token, baseURL),
    printableQR: `QR Code for ${tokenData.name}: ${generateQRCodeURL(tokenData.token, baseURL)}`
  }))
}

/**
 * Gets QR codes grouped by location type
 */
export function getQRCodesByType(baseURL: string = "https://menu.theplazahoteledirne.com") {
  const allQRCodes = getAllQRCodes(baseURL)
  
  return {
    rooms: allQRCodes.filter(qr => qr.type === "room"),
    restaurant: allQRCodes.filter(qr => qr.type === "restaurant"),
    garden: allQRCodes.filter(qr => qr.type === "garden")
  }
}

/**
 * Generate a test URL for development
 */
export function generateTestURL(token: string): string {
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location
    return `${protocol}//${host}?token=${encodeURIComponent(token)}`
  }
  return `http://localhost:3000?token=${encodeURIComponent(token)}`
} 