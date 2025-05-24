import type { Category, MenuItem } from "@/types/menu"

export const categories: Category[] = [
  { id: "all", name: "Tüm Menü", nameKey: "category.all", items: 159 },
  { id: "breakfast", name: "Kahvaltı", nameKey: "category.breakfast", items: 12 },
  { id: "starters", name: "Başlangıçlar ve Mezeler", nameKey: "category.starters", items: 16 },
  { id: "salads", name: "Salatalar", nameKey: "category.salads", items: 8 },
  { id: "main-dishes", name: "Ana Yemekler", nameKey: "category.mainDishes", items: 12 },
  { id: "pasta", name: "Makarnalar", nameKey: "category.pasta", items: 6 },
  { id: "burgers", name: "Hamburgerler", nameKey: "category.burgers", items: 3 },
  { id: "desserts", name: "Tatlılar", nameKey: "category.desserts", items: 6 },
  { id: "drinks", name: "İçecekler", nameKey: "category.drinks", items: 28 },
  { id: "spirits", name: "Yüksek Alkollü İçecekler", nameKey: "category.spirits", items: 20 },
  { id: "cocktails", name: "Kokteyller", nameKey: "category.cocktails", items: 3 },
  { id: "beers", name: "Biralar", nameKey: "category.beers", items: 9 },
  { id: "wines", name: "Şaraplar", nameKey: "category.wines", items: 31 },
  { id: "extras", name: "Ekstralar", nameKey: "category.extras", items: 5 },
]
