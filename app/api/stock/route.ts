import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const STOCK_FILE_PATH = path.join(process.cwd(), 'data', 'stock-status.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(STOCK_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Get current stock status
export async function GET() {
  try {
    await ensureDataDirectory()
    
    try {
      const data = await fs.readFile(STOCK_FILE_PATH, 'utf8')
      const stockStatus = JSON.parse(data)
      return NextResponse.json({ stockStatus })
    } catch (error) {
      // File doesn't exist yet, return empty stock status
      return NextResponse.json({ stockStatus: {} })
    }
  } catch (error) {
    console.error('Error reading stock status:', error)
    return NextResponse.json({ error: 'Failed to read stock status' }, { status: 500 })
  }
}

// Update stock status
export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectory()
    
    const body = await request.json()
    const { itemId, isAvailable } = body

    if (!itemId || typeof isAvailable !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Read current stock status
    let stockStatus: Record<string, boolean> = {}
    try {
      const data = await fs.readFile(STOCK_FILE_PATH, 'utf8')
      stockStatus = JSON.parse(data)
    } catch {
      // File doesn't exist yet, start with empty object
      stockStatus = {}
    }

    // Update the specific item
    stockStatus[itemId] = isAvailable

    // Write back to file
    await fs.writeFile(STOCK_FILE_PATH, JSON.stringify(stockStatus, null, 2))

    return NextResponse.json({ success: true, stockStatus })
  } catch (error) {
    console.error('Error updating stock status:', error)
    return NextResponse.json({ error: 'Failed to update stock status' }, { status: 500 })
  }
}

// Bulk update stock status (for admin operations)
export async function PUT(request: NextRequest) {
  try {
    await ensureDataDirectory()
    
    const body = await request.json()
    const { stockStatus } = body

    if (!stockStatus || typeof stockStatus !== 'object') {
      return NextResponse.json({ error: 'Invalid stock status data' }, { status: 400 })
    }

    // Write the entire stock status
    await fs.writeFile(STOCK_FILE_PATH, JSON.stringify(stockStatus, null, 2))

    return NextResponse.json({ success: true, stockStatus })
  } catch (error) {
    console.error('Error bulk updating stock status:', error)
    return NextResponse.json({ error: 'Failed to bulk update stock status' }, { status: 500 })
  }
} 