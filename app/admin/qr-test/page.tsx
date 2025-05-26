"use client"

import { useState } from "react"
import { getAllQRCodes, getQRCodesByType, generateTestURL } from "@/lib/qr-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function QRTestPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const qrCodesByType = getQRCodesByType()

  const copyToClipboard = async (text: string, token: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const openTestURL = (token: string) => {
    const testURL = generateTestURL(token)
    window.open(testURL, '_blank')
  }

  const renderTokenCards = (tokens: any[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((tokenData) => (
          <Card key={tokenData.token} className="bg-[#1a2234] border-[#2a3346]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white">{tokenData.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {tokenData.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-gray-400 font-mono break-all">
                {tokenData.token}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(tokenData.qrCodeURL, tokenData.token)}
                  className="flex-1"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedToken === tokenData.token ? "Copied!" : "Copy URL"}
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => openTestURL(tokenData.token)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">QR Code Test System</h1>
              <p className="text-gray-400">Test the QR access control system with different tokens</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Admin</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="bg-[#1a2234] border border-[#2a3346]">
            <TabsTrigger value="rooms" className="data-[state=active]:bg-blue-500">
              <QrCode className="h-4 w-4 mr-2" />
              Hotel Rooms ({qrCodesByType.rooms.length})
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="data-[state=active]:bg-blue-500">
              <QrCode className="h-4 w-4 mr-2" />
              Restaurant Tables ({qrCodesByType.restaurant.length})
            </TabsTrigger>
            <TabsTrigger value="garden" className="data-[state=active]:bg-blue-500">
              <QrCode className="h-4 w-4 mr-2" />
              Garden Tables ({qrCodesByType.garden.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            {renderTokenCards(qrCodesByType.rooms, "Hotel Room QR Codes")}
          </TabsContent>

          <TabsContent value="restaurant">
            {renderTokenCards(qrCodesByType.restaurant, "Restaurant Table QR Codes")}
          </TabsContent>

          <TabsContent value="garden">
            {renderTokenCards(qrCodesByType.garden, "Garden Table QR Codes")}
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">How to Test</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>1. Click "Test" button to open a new tab with the QR token</li>
            <li>2. You should see the language selection page if the token is valid</li>
            <li>3. Select a language to proceed to the menu</li>
            <li>4. Try accessing /menu directly without a token - you should be redirected to access denied</li>
            <li>5. The system also validates restaurant hours (12:00 PM - 12:00 AM)</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2">QR Code Flow</h3>
          <div className="text-gray-300 text-sm">
            <p><strong>Step 1:</strong> User scans QR code → Directed to language selection page</p>
            <p><strong>Step 2:</strong> User selects preferred language → Automatically redirected to menu</p>
            <p><strong>Step 3:</strong> User can browse menu, add items to cart, and place orders</p>
          </div>
        </div>
      </div>
    </div>
  )
} 