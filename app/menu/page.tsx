"use client"

import { useState, useEffect } from "react"
import { AccessGuard } from "@/components/access-guard"
import { useLanguage } from "@/contexts/language-context"
import { useAccess } from "@/contexts/access-context"
import { categories } from "@/data/menu"
import {
  burgers,
  desserts,
  cocktails,
  beers,
  drinks,
  spirits,
  breakfast,
  starters,
  salads,
  mainDishes,
  pasta,
  extras,
  wines,
} from "@/data/menu-items"
import type { MenuItem, BeerCategory, SpiritCategory, DrinkCategory, WineCategory } from "@/types/menu"
import { MenuHeader } from "@/components/menu-header"
import { CategoryTabs } from "@/components/category-tabs"
import { EnhancedMenuItemCard } from "@/components/enhanced-menu-item-card"
import { motion } from "framer-motion"
import { UtensilsCrossed, Beer, Wine, Coffee, GlassWater, Citrus, Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Image from "next/image"

export default function MenuPage() {
  const { t } = useLanguage()
  const { isViewOnlyMode } = useAccess()
  const [activeCategory, setActiveCategory] = useState("all")
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeBeerTab, setActiveBeerTab] = useState<BeerCategory>("local")
  const [activeSpiritTab, setActiveSpiritTab] = useState<SpiritCategory>("whisky")
  const [activeDrinkTab, setActiveDrinkTab] = useState<DrinkCategory>("coffee")
  const [activeWineTab, setActiveWineTab] = useState<WineCategory>("white")
  const [activeWineBrand, setActiveWineBrand] = useState<string | null>(null)

  // Filter items based on active category and search query
  useEffect(() => {
    let items: MenuItem[] = [];

    // If there's a search query, search across ALL items regardless of category
    if (searchQuery) {
      items = [
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
        ...extras,
        ...wines,
      ];
      
      // Filter by search query across all items
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        // Get localized name only (no description search)
        const localizedName = item.nameKey ? t(item.nameKey) : (item.name || '');
        
        // Search only in name (both localized and original)
        return (
          localizedName.toLowerCase().includes(query) ||
          (item.name?.toLowerCase() ?? '').includes(query)
        );
      });
    } else {
      // If no search query, filter by category normally
      if (activeCategory === "all") {
        items = [
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
          ...extras,
          ...wines,
        ];
      } else {
        // Map category ID to the corresponding array
        switch (activeCategory) {
          case "breakfast":
            items = breakfast;
            break;
          case "starters":
            items = starters;
            break;
          case "salads":
            items = salads;
            break;
          case "main-dishes":
            items = mainDishes;
            break;
          case "pasta":
            items = pasta;
            break;
          case "burgers":
            items = burgers;
            break;
          case "desserts":
            items = desserts;
            break;
          case "cocktails":
            items = cocktails;
            break;
          case "beers":
            items = beers;
            break;
          case "drinks":
            items = drinks;
            break;
          case "spirits":
            items = spirits;
            break;
          case "wines":
            items = wines;
            break;
          case "extras":
            items = extras;
            break;
          default:
            items = [];
        }
      }

      // Apply subcategory filters only when no search query and specific category is selected
      if (activeCategory === "beers" && activeBeerTab) {
        items = items.filter((item) => item.subcategory === activeBeerTab);
      }

      if (activeCategory === "drinks" && activeDrinkTab) {
        items = items.filter((item) => item.subcategory === activeDrinkTab);
      }

      if (activeCategory === "spirits" && activeSpiritTab) {
        items = items.filter((item) => item.subcategory === activeSpiritTab);
      }

      if (activeCategory === "wines" && activeWineTab) {
        items = items.filter((item) => item.subcategory === activeWineTab);
      }

      // Additional filter by wine brand if selected
      if (activeCategory === "wines" && activeWineBrand) {
        items = items.filter((item) => item.brand === activeWineBrand);
      }
    }

    setFilteredItems(items);
  }, [activeCategory, searchQuery, activeBeerTab, activeSpiritTab, activeDrinkTab, activeWineTab, activeWineBrand]);

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
  }

  const handleWineBrandSelect = (brand: string | null) => {
    setActiveWineBrand(brand === activeWineBrand ? null : brand)
  }

  return (
    <AccessGuard requireValidToken={!isViewOnlyMode} requireOpenHours={!isViewOnlyMode}>
    <div className="flex flex-col min-h-screen bg-[#0f172a]">
      <MenuHeader onSearch={handleSearch} />

      <CategoryTabs categories={categories} activeCategory={activeCategory} onSelectCategory={handleSelectCategory} />

      {/* Search indicator */}
      {searchQuery && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 mx-4 mt-2 mb-2 p-3 rounded-md"
        >
          <div className="flex items-center text-blue-400">
            <Search className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {t("app.searchResults").replace("{query}", searchQuery)}
            </span>
          </div>
        </motion.div>
      )}

      <div className="flex-1 p-4">
        {/* Beer subcategories */}
        {activeCategory === "beers" && !searchQuery && (
          <Tabs
            value={activeBeerTab}
            onValueChange={(value) => setActiveBeerTab(value as BeerCategory)}
            className="mb-4"
          >
            <TabsList className="w-full bg-[#1a2234] border border-[#2a3346]">
              <TabsTrigger
                value="local"
                className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Beer className="h-4 w-4 mr-2" />
                {t("beer.subcategory.local")}
              </TabsTrigger>
              <TabsTrigger
                value="import"
                className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Beer className="h-4 w-4 mr-2" />
                {t("beer.subcategory.imported")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Spirits subcategories */}
        {activeCategory === "spirits" && !searchQuery && (
          <ScrollArea className="w-full whitespace-nowrap mb-4">
            <Tabs value={activeSpiritTab} onValueChange={(value) => setActiveSpiritTab(value as SpiritCategory)}>
              <TabsList className="bg-[#1a2234] border border-[#2a3346] inline-flex w-auto p-1">
                <TabsTrigger
                  value="whisky"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  Viski
                </TabsTrigger>
                <TabsTrigger
                  value="raki"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  Rakı
                </TabsTrigger>
                <TabsTrigger
                  value="gin"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  Cin
                </TabsTrigger>
                <TabsTrigger
                  value="tequila"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  Tekila
                </TabsTrigger>
                <TabsTrigger
                  value="vodka"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  Votka
                </TabsTrigger>
                <TabsTrigger
                  value="jagermeister"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  Jägermeister
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Drinks subcategories */}
        {activeCategory === "drinks" && !searchQuery && (
          <Tabs
            value={activeDrinkTab}
            onValueChange={(value) => setActiveDrinkTab(value as DrinkCategory)}
            className="mb-4"
          >
            <TabsList className="w-full bg-[#1a2234] border border-[#2a3346]">
              <TabsTrigger
                value="coffee"
                className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Kahveler
              </TabsTrigger>
              <TabsTrigger
                value="soft"
                className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <GlassWater className="h-4 w-4 mr-2" />
                Meşrubatlar
              </TabsTrigger>
              <TabsTrigger
                value="fresh"
                className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Citrus className="h-4 w-4 mr-2" />
                Taze Sıkma
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Wine subcategories */}
        {activeCategory === "wines" && !searchQuery && (
          <>
            {/* Wine brand filter */}
            <div className="mb-4 bg-[#1a2234] border border-[#2a3346] p-4 rounded-md">
              <div className="flex flex-row justify-center gap-4 mb-2">
                <button
                  onClick={() => handleWineBrandSelect("edrine")}
                  className={`relative h-20 w-24 flex items-center justify-center p-2 rounded-md transition-all ${
                    activeWineBrand === "edrine"
                      ? "bg-[#0f172a] border-2 border-blue-500"
                      : "bg-[#0f172a] border border-[#2a3346] hover:border-gray-400"
                  }`}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    <Image
                      src="/images/logos/edrine-logo.png"
                      alt="Edrine"
                      width={60}
                      height={60}
                      className="object-contain max-h-16"
                    />
                  </div>
                </button>
                <button
                  onClick={() => handleWineBrandSelect("suvla")}
                  className={`relative h-20 w-24 flex items-center justify-center p-2 rounded-md transition-all ${
                    activeWineBrand === "suvla"
                      ? "bg-[#0f172a] border-2 border-blue-500"
                      : "bg-[#0f172a] border border-[#2a3346] hover:border-gray-400"
                  }`}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    <Image
                      src="/images/logos/suvla-logo.png"
                      alt="Suvla"
                      width={80}
                      height={40}
                      className="object-contain max-h-12"
                    />
                  </div>
                </button>
                <button
                  onClick={() => handleWineBrandSelect("chamlija")}
                  className={`relative h-20 w-24 flex items-center justify-center p-2 rounded-md transition-all ${
                    activeWineBrand === "chamlija"
                      ? "bg-[#0f172a] border-2 border-blue-500"
                      : "bg-[#0f172a] border border-[#2a3346] hover:border-gray-400"
                  }`}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    <Image
                      src="/images/logos/chamlija-logo.png"
                      alt="Chamlija"
                      width={80}
                      height={40}
                      className="object-contain max-h-12"
                    />
                  </div>
                </button>
              </div>
              {activeWineBrand && (
                <div className="text-center">
                  <button
                    onClick={() => setActiveWineBrand(null)}
                    className="text-blue-400 hover:text-blue-300 bg-[#0f172a] px-4 py-2 rounded-md border border-[#2a3346] hover:border-blue-500 transition-all text-sm font-medium"
                  >
                    {t("wine.showAllBrands")}
                  </button>
                </div>
              )}
            </div>

            <Tabs
              value={activeWineTab}
              onValueChange={(value) => setActiveWineTab(value as WineCategory)}
              className="mb-4"
            >
              <TabsList className="w-full bg-[#1a2234] border border-[#2a3346]">
                <TabsTrigger
                  value="red"
                  className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  {t("wine.subcategory.red")}
                </TabsTrigger>
                <TabsTrigger
                  value="white"
                  className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  {t("wine.subcategory.white")}
                </TabsTrigger>
                <TabsTrigger
                  value="rose"
                  className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <Wine className="h-4 w-4 mr-2" />
                  {t("wine.subcategory.rose")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        )}

        {/* Wine pairing guide */}
        {activeCategory === "wines" && (
          <div className="mb-4 bg-[#1a2234] border border-[#2a3346] rounded-md p-3">
            <h3 className="text-sm font-medium text-white mb-2">{t("wine.foodPairings")}</h3>
            <div className="grid grid-cols-5 gap-1 text-xs mb-2">
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">0</div>
                <div>{t("wine.pairingCategory.starters")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">1</div>
                <div>{t("wine.pairingCategory.salads")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">2</div>
                <div>{t("wine.pairingCategory.appetizers")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">3</div>
                <div>{t("wine.pairingCategory.charcuterie")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">4</div>
                <div>{t("wine.pairingCategory.cheese")}</div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1 text-xs">
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">5</div>
                <div>{t("wine.pairingCategory.fruit")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">6</div>
                <div>{t("wine.pairingCategory.chicken")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">7</div>
                <div>{t("wine.pairingCategory.redMeat")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">8</div>
                <div>{t("wine.pairingCategory.tomatoSauce")}</div>
              </div>
              <div className="bg-[#0f172a] p-1 rounded text-center">
                <div className="font-bold">9</div>
                <div>{t("wine.pairingCategory.creamSauce")}</div>
              </div>
            </div>
          </div>
        )}

        {/* Wine region grouping */}
        {activeCategory === "wines" && !searchQuery && filteredItems.length > 0 && (
          <div className="mb-4">
            {Array.from(new Set(
              filteredItems
                .map((item) => item.region)
                .filter((region): region is string => !!region)
            ))
            .map((region) => (
              <div key={region} className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3 border-b border-[#2a3346] pb-2 flex items-center">
                  <Wine className="h-5 w-5 mr-2" />
                  {t(region)}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems
                    .filter((item) => item.region === region)
                    .map((item) => (
                      <EnhancedMenuItemCard key={`${item.id}-${item.region}`} item={item} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Regular items display */}
        {(activeCategory !== "wines" || searchQuery) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <EnhancedMenuItemCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-60 text-center"
          >
            <UtensilsCrossed className="h-12 w-12 mb-4 text-gray-400" />
            {searchQuery ? (
              <>
                <p className="text-xl font-medium mb-2 text-white">{t("app.noResultsFound").replace("{query}", searchQuery)}</p>
                <p className="text-gray-400">{t("app.searchSuggestion")}</p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium mb-2 text-white">{t("app.noResultsFoundGeneral")}</p>
                <p className="text-gray-400">{t("app.categorySuggestion")}</p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
    </AccessGuard>
  )
}
