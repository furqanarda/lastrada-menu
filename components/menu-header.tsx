"use client"

import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShoppingBag } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

type MenuHeaderProps = {
  onSearch?: (query: string) => void
}

export function MenuHeader({ onSearch }: MenuHeaderProps) {
  const { totalItems } = useCart()
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  // Get the flag for current language
  const getLanguageFlag = () => {
    switch(language) {
      case "tr": return "🇹🇷";
      case "en": return "🇬🇧";
      case "el": return "🇬🇷";
      case "bg": return "🇧🇬";
      default: return "🇹🇷"; // Default to Turkish
    }
  }

  // Update search results as user types
  useEffect(() => {
    if (onSearch) {
      onSearch(searchQuery)
    }
  }, [searchQuery, onSearch])

  return (
    <div className="sticky top-0 z-10 bg-[#0f172a] border-b border-[#2a3346] p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="La Strada Restaurant" width={120} height={40} className="mr-2" />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" className="bg-[#1a2234] border-[#2a3346] text-white w-10 h-10 p-0 flex items-center justify-center">
                <span className="text-xl">{getLanguageFlag()}</span>
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative bg-[#1a2234] border-[#2a3346] text-white">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <Input
            type="text"
            placeholder="Ara"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1a2234] border-[#2a3346] text-white pr-10 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full text-gray-400 hover:text-white"
            onClick={() => setSearchQuery("")}
          >
            {searchQuery ? <span className="text-sm">✕</span> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
