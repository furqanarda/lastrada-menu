"use client"

import { useState, useEffect } from "react"
import { useStock } from "@/contexts/stock-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Search, Package, PackageX, ArrowLeft, Filter, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

// Import all menu data
import { breakfast } from "@/data/menu-items"
import { starters } from "@/data/menu-items"
import { salads } from "@/data/menu-items"
import { mainDishes } from "@/data/menu-items"
import { pasta } from "@/data/menu-items"
import { burgers } from "@/data/menu-items"
import { desserts } from "@/data/menu-items"
import { cocktails } from "@/data/menu-items"
import { beers } from "@/data/menu-items"
import { drinks } from "@/data/menu-items"
import { spirits } from "@/data/menu-items"
import { wines } from "@/data/menu-items"
import { extras } from "@/data/menu-items"

import type { MenuItem } from "@/types/menu"

// Password protection component
function PasswordProtection({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  // Simple password - you can change this to your desired password
  const ADMIN_PASSWORD = "lastrada2025"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      onAuthenticate()
      setIsWrong(false)
    } else {
      setIsWrong(true)
      setPassword("")
      // Clear error after 3 seconds
      setTimeout(() => setIsWrong(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1a2234] border-[#2a3346]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-500/20 p-4 rounded-full">
              <Lock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Stok Yönetimi</CardTitle>
            <p className="text-gray-400 mt-2">La Strada Restaurant - Admin Girişi</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Şifre
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin şifresini girin..."
                  className={`bg-[#0f172a] border-[#2a3346] text-white pr-10 ${
                    isWrong ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isWrong && (
                <p className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Yanlış şifre. Tekrar deneyin.
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!password.trim()}
            >
              Giriş Yap
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/menu">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Menüye Geri Dön
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminPage() {
  const { stockStatus, toggleItemAvailability, isItemAvailable, isLoading } = useStock()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated (stored in sessionStorage)
  useEffect(() => {
    const authenticated = sessionStorage.getItem('admin-authenticated')
    if (authenticated === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthenticate = () => {
    setIsAuthenticated(true)
    // Store authentication in session (will be cleared when browser is closed)
    sessionStorage.setItem('admin-authenticated', 'true')
  }

  // If not authenticated, show password protection
  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticate={handleAuthenticate} />
  }

  // Combine all menu items
  const allItems: MenuItem[] = [
    ...breakfast,
    ...starters,
    ...salads,
    ...mainDishes,
    ...pasta,
    ...burgers,
    ...desserts,
    ...cocktails,
    ...beers,
    ...drinks,
    ...spirits,
    ...wines,
    ...extras,
  ]

  // Categories for filtering
  const categories = [
    { id: "all", name: "Tümü", items: allItems, icon: "🍽️" },
    { id: "breakfast", name: "Kahvaltı", items: breakfast, icon: "🥐" },
    { id: "starters", name: "Başlangıçlar", items: starters, icon: "🥗" },
    { id: "salads", name: "Salatalar", items: salads, icon: "🥬" },
    { id: "main-dishes", name: "Ana Yemek", items: mainDishes, icon: "🍖" },
    { id: "pasta", name: "Makarna", items: pasta, icon: "🍝" },
    { id: "burgers", name: "Burger", items: burgers, icon: "🍔" },
    { id: "desserts", name: "Tatlı", items: desserts, icon: "🍰" },
    { id: "cocktails", name: "Kokteyl", items: cocktails, icon: "🍹" },
    { id: "beers", name: "Bira", items: beers, icon: "🍺" },
    { id: "drinks", name: "İçecek", items: drinks, icon: "☕" },
    { id: "spirits", name: "Alkol", items: spirits, icon: "🥃" },
    { id: "wines", name: "Şarap", items: wines, icon: "🍷" },
    { id: "extras", name: "Ekstra", items: extras, icon: "🍿" },
  ]

  // Filter items based on search and category
  const filteredItems = allItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      (item.nameKey ? t(item.nameKey) : (item.name || "")).toLowerCase().includes(searchQuery.toLowerCase())
    
    // If there's a search query, show results from all categories
    // Otherwise, apply category filter
    const matchesCategory = searchQuery !== "" || selectedCategory === "all" || item.category === selectedCategory
    
    // Apply out-of-stock filter if active
    const matchesStockFilter = !showOutOfStockOnly || !isItemAvailable(item.id)
    
    return matchesSearch && matchesCategory && matchesStockFilter
  })

  // Count available and unavailable items
  const availableCount = filteredItems.filter(item => isItemAvailable(item.id)).length
  const unavailableCount = filteredItems.filter(item => !isItemAvailable(item.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Mobile Header */}
        <div className="sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur-sm border-b border-[#2a3346] -mx-4 px-4 py-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/menu">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-2">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Menüye Dön</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-blue-400" />
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">Stok Yönetimi</h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">La Strada Restaurant</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1a2234] rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Mevcut</p>
                  <p className="text-lg font-bold text-green-400">{availableCount}</p>
                </div>
                <Package className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <button
              onClick={() => {
                setShowOutOfStockOnly(!showOutOfStockOnly)
                // Clear search when toggling out-of-stock filter
                if (!showOutOfStockOnly) {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }
              }}
              className={`bg-[#1a2234] rounded-lg p-3 border transition-all hover:scale-[1.02] ${
                showOutOfStockOnly 
                  ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20' 
                  : 'border-red-500/20 hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Tükendi</p>
                  <p className="text-lg font-bold text-red-400">{unavailableCount}</p>
                  {showOutOfStockOnly && (
                    <p className="text-xs text-red-300 mt-1">Sadece tükenmişler</p>
                  )}
                </div>
                <PackageX className="h-6 w-6 text-red-400" />
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Menü öğelerini ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a2234] border-[#2a3346] text-white placeholder:text-gray-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <div className="mt-2 text-xs text-blue-400 flex items-center">
                <Search className="h-3 w-3 mr-1" />
                Tüm kategorilerde "{searchQuery}" araması yapılıyor
              </div>
            )}
            {showOutOfStockOnly && !searchQuery && (
              <div className="mt-2 text-xs text-red-400 flex items-center">
                <PackageX className="h-3 w-3 mr-1" />
                Sadece tükenen ürünler gösteriliyor
                <button
                  onClick={() => setShowOutOfStockOnly(false)}
                  className="ml-2 text-xs bg-red-500/20 px-2 py-1 rounded-full hover:bg-red-500/30 transition-colors"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-400">Kategoriler</span>
          </div>
          
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {categories.map((category) => {
                // Calculate count based on current search
                const categoryCount = searchQuery 
                  ? filteredItems.filter(item => item.category === category.id).length
                  : (category.id === "all" 
                    ? allItems.length 
                    : allItems.filter(item => item.category === category.id).length
                  )
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      // Clear search and out-of-stock filter when selecting a category
                      if (searchQuery || showOutOfStockOnly) {
                        setSearchQuery("")
                        setShowOutOfStockOnly(false)
                      }
                      setSelectedCategory(category.id)
                    }}
                    disabled={searchQuery !== "" || showOutOfStockOnly}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      searchQuery !== "" || showOutOfStockOnly
                        ? 'bg-[#1a2234] text-gray-500 border border-[#2a3346] opacity-50 cursor-not-allowed'
                        : selectedCategory === category.id
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-[#1a2234] text-gray-300 hover:bg-[#2a3346] border border-[#2a3346]'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        searchQuery !== "" || showOutOfStockOnly
                          ? 'bg-[#2a3346] text-gray-500'
                          : selectedCategory === category.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-[#2a3346] text-gray-400'
                      }`}
                    >
                      {categoryCount}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="bg-[#1a2234] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-[#2a3346]">
              <Package className="h-10 w-10 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Stok durumu yükleniyor...</h3>
            <p className="text-gray-400">Lütfen bekleyin</p>
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`bg-[#1a2234] border-[#2a3346] transition-all duration-200 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 ${
                !isItemAvailable(item.id) ? 'opacity-75 border-red-500/30' : 'hover:scale-[1.02]'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium text-white truncate leading-tight">
                      {item.nameKey ? t(item.nameKey) : (item.name || "")}
                    </CardTitle>
                    <p className="text-xs text-gray-400 mt-1">#{item.id}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-2">
                    <Switch
                      checked={isItemAvailable(item.id)}
                      onCheckedChange={() => toggleItemAvailability(item.id)}
                      className="data-[state=checked]:bg-green-500 scale-90"
                    />
                    <Badge 
                      variant={isItemAvailable(item.id) ? "default" : "destructive"}
                      className={`text-xs px-2 py-1 ${
                        isItemAvailable(item.id) 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {isItemAvailable(item.id) ? "Mevcut" : "Tükendi"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex space-x-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0f172a] flex-shrink-0 border border-[#2a3346]">
                    <Image
                      src={item.image || `https://placehold.co/64x64/1e293b/ffffff?text=${encodeURIComponent((item.nameKey ? t(item.nameKey) : (item.name || "Item")).slice(0, 2))}`}
                      alt={item.nameKey ? t(item.nameKey) : (item.name || "")}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/64x64/1e293b/ffffff?text=${encodeURIComponent((item.nameKey ? t(item.nameKey) : (item.name || "Item")).slice(0, 2))}`
                      }}
                    />
                    {!isItemAvailable(item.id) && (
                      <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
                        <PackageX className="h-6 w-6 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-2">
                      {item.descriptionKey ? t(item.descriptionKey) : (item.description || "")}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-400">
                          ₺{item.price}
                        </span>
                        {item.weight && (
                          <span className="text-xs text-gray-500">
                            {item.weight === "1 şişe (75cl)" ? t("wine.bottleSize") : item.weight}
                          </span>
                        )}
                      </div>
                      
                      {item.category && (
                        <Badge variant="outline" className="text-xs border-[#2a3346] text-gray-400">
                          {categories.find(cat => cat.id === item.category)?.icon || "📄"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-[#1a2234] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-[#2a3346]">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Hiç öğe bulunamadı</h3>
            <p className="text-gray-400 mb-4">Arama veya filtre kriterlerinizi ayarlamayı deneyin</p>
            <Button 
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setShowOutOfStockOnly(false)
              }}
              variant="outline"
              className="border-[#2a3346] text-gray-300 hover:bg-[#2a3346]"
            >
              Filtreleri Temizle
            </Button>
          </div>
        )}

        {/* Summary Stats at Bottom */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>
              Toplam {filteredItems.length} öğe gösteriliyor
              {selectedCategory !== "all" && !searchQuery && !showOutOfStockOnly && (
                <span> • {categories.find(cat => cat.id === selectedCategory)?.name} kategorisi</span>
              )}
              {searchQuery && (
                <span> • "{searchQuery}" araması</span>
              )}
              {showOutOfStockOnly && (
                <span> • Sadece tükenen ürünler</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 