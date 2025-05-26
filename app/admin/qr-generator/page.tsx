"use client"

import { useState, useEffect } from "react"
import { getAllTokens } from "@/lib/auth"
import { generateQRCodeURL, getQRCodesByType } from "@/lib/qr-generator"

type TokenData = {
  token: string
  type: string
  location: string
  name: string
  qrCodeURL: string
}

export default function QRGeneratorPage() {
  const [qrCodes, setQrCodes] = useState<{
    rooms: TokenData[]
    restaurant: TokenData[]
    garden: TokenData[]
  }>({ rooms: [], restaurant: [], garden: [] })
  const [selectedTab, setSelectedTab] = useState<"rooms" | "restaurant" | "garden">("rooms")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadQRCodes = () => {
      try {
        const qrCodeData = getQRCodesByType()
        setQrCodes(qrCodeData)
      } catch (error) {
        console.error("Failed to load QR codes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQRCodes()
  }, [])

  const filteredData = qrCodes[selectedTab].filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const downloadCSV = (data: TokenData[], filename: string) => {
    const headers = ["Room/Table", "Name", "Token", "QR Code URL"]
    const csvContent = [
      headers.join(","),
      ...data.map(item => [
        `"${item.location}"`,
        `"${item.name}"`,
        `"${item.token}"`,
        `"${item.qrCodeURL}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadJSON = (data: TokenData[], filename: string) => {
    const jsonContent = JSON.stringify({
      generated: new Date().toISOString(),
      baseURL: "https://menu.theplazahoteledirne.com",
      total: data.length,
      data: data
    }, null, 2)

    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadHTML = (data: TokenData[], filename: string) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada Hotel - ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} QR Codes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .qr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .qr-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .qr-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .qr-url { font-size: 12px; word-break: break-all; color: #666; margin-top: 10px; }
        .instructions { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        @media print { .qr-card { page-break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>La Strada Hotel - ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} QR Codes</h1>
        <p>Total: ${data.length} | Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="instructions">
        <h3>How to Generate QR Code Images:</h3>
        <ol>
            <li>Copy the URL from each card below</li>
            <li>Go to <a href="https://qr-code-generator.com" target="_blank">qr-code-generator.com</a></li>
            <li>Paste the URL and generate the QR code</li>
            <li>Download as PNG/SVG and print</li>
        </ol>
    </div>
    
    <div class="qr-grid">
        ${data.map(item => `
            <div class="qr-card">
                <div class="qr-title">${item.name}</div>
                <div>Token: <code>${item.token}</code></div>
                <div class="qr-url">
                    <strong>QR Code URL:</strong><br>
                    <a href="${item.qrCodeURL}" target="_blank">${item.qrCodeURL}</a>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.html`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
      alert("Failed to copy to clipboard")
    }
  }

  const copyAllURLs = async () => {
    const urls = filteredData.map(item => `${item.name}: ${item.qrCodeURL}`).join("\n")
    await copyToClipboard(urls)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR codes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
          <p className="text-gray-600">Generate and manage QR codes for all hotel locations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hotel Rooms</h3>
            <p className="text-3xl font-bold text-blue-600">{qrCodes.rooms.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurant Tables</h3>
            <p className="text-3xl font-bold text-green-600">{qrCodes.restaurant.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Garden Tables</h3>
            <p className="text-3xl font-bold text-purple-600">{qrCodes.garden.length}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            {(["rooms", "restaurant", "garden"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({qrCodes[tab].length})
              </button>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder={`Search ${selectedTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyAllURLs}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Copy All URLs
              </button>
              <button
                onClick={() => downloadCSV(filteredData, `${selectedTab}-qr-codes`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download CSV
              </button>
              <button
                onClick={() => downloadJSON(filteredData, `${selectedTab}-qr-codes`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download JSON
              </button>
              <button
                onClick={() => downloadHTML(filteredData, `${selectedTab}-qr-codes`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Download HTML
              </button>
            </div>
          </div>
        </div>

        {/* QR Codes Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} QR Codes
            </h2>
            <span className="text-gray-600">
              Showing {filteredData.length} of {qrCodes[selectedTab].length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((item) => (
              <div key={item.token} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600">Location: {item.location}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Token:</span>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">{item.token}</code>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">QR URL:</span>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs break-all">
                      {item.qrCodeURL}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.qrCodeURL)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy URL
                  </button>
                  <a
                    href={item.qrCodeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors text-center"
                  >
                    Test
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No {selectedTab} found matching your search.</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Create Physical QR Codes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Option 1: Manual Generation</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy the QR URL from any card above</li>
                <li>Go to <a href="https://qr-code-generator.com" target="_blank" className="underline">qr-code-generator.com</a></li>
                <li>Paste the URL and generate the QR code</li>
                <li>Download as PNG/SVG and print</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Option 2: Bulk Generation</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Download the CSV or JSON file</li>
                <li>Use a bulk QR generator service</li>
                <li>Upload the file to generate all QR codes</li>
                <li>Print and distribute to rooms/tables</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 