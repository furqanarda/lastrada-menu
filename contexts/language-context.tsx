"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define available languages
export type Language = "en" | "tr" | "el" | "bg"

// Define language context type
type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "tr", // Default to Turkish
  setLanguage: () => {},
  t: (key) => key,
})

// Define translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    "app.name": "La Strada Restaurant",
    "app.hotel": "The Plaza Hotel Edirne",
    "app.selectLanguage": "Select Language",
    "app.search": "Search",
    "app.cart": "Cart",
    "app.menu": "Menu",
    "app.order": "Order",
    "app.processOrder": "Process Order",
    "app.orderSummary": "Order Summary",
    "app.subtotal": "Subtotal",
    "app.total": "Total",
    "app.tax": "Tax",
    "app.roomNumber": "Room Number",
    "app.tableNumber": "Table Number",
    "app.enterRoomOrTable": "Enter Room or Table Number",
    "app.notes": "Notes",
    "app.addNotes": "Add Notes",
    "app.back": "Back",
    "app.continue": "Continue",
    "app.orderConfirmation": "Order Confirmation",
    "app.orderSent": "Your order has been sent!",
    "app.orderNumber": "Order Number",
    "app.orderTime": "Order Time",
    "app.orderTotal": "Order Total",
    "app.newOrder": "New Order",
    "app.emptyCart": "Your cart is empty",
    "app.addItems": "Add Items",
    "app.add": "Add",
    "app.select": "Select",
    "app.addToCart": "Add to Cart",
    "app.details": "Details",
    "app.allergens": "Allergens",
    "app.reviews": "Reviews",
    "app.options": "Options",
    "app.portion": "Portion",
    "app.allergenInfo": "Allergen Information",
    "app.containsAllergens": "This product contains the following allergens",
    "app.allergenWarning": "If you have allergies, please inform the staff before ordering",
    "app.customerReviews": "Customer Reviews",
    "app.bestSeller": "Best Seller",

    // Categories
    "category.all": "All Menu",
    "category.breakfast": "Breakfast",
    "category.starters": "Starters & Appetizers",
    "category.salads": "Salads",
    "category.mainDishes": "Main Dishes",
    "category.pasta": "Pasta",
    "category.burgers": "Burgers",
    "category.desserts": "Desserts",
    "category.drinks": "Drinks",
    "category.spirits": "Spirits",
    "category.cocktails": "Cocktails",
    "category.beers": "Beers",
    "category.wines": "Wines",
    "category.extras": "Extras",

    // Allergens
    "allergen.contains": "Contains",
    "allergen.gluten": "Gluten",
    "allergen.dairy": "Dairy",
    "allergen.nuts": "Nuts",
    "allergen.eggs": "Eggs",
    "allergen.fish": "Fish",
    "allergen.shellfish": "Shellfish",
    "allergen.soy": "Soy",
    "allergen.wheat": "Wheat",
    "allergen.alcohol": "Alcohol",

    // Wine
    "wine.pairing": "Pairing",
    "wine.pairsWellWith": "This wine pairs well with",
    "wine.foodPairings": "Food Pairings",
  },
  tr: {
    // Common
    "app.name": "La Strada Restaurant",
    "app.hotel": "The Plaza Hotel Edirne",
    "app.selectLanguage": "Dil Seçin",
    "app.search": "Ara",
    "app.cart": "Sepet",
    "app.menu": "Menü",
    "app.order": "Sipariş",
    "app.processOrder": "Siparişi Tamamla",
    "app.orderSummary": "Sipariş Özeti",
    "app.subtotal": "Ara Toplam",
    "app.total": "Toplam",
    "app.tax": "Vergi",
    "app.roomNumber": "Oda Numarası",
    "app.tableNumber": "Masa Numarası",
    "app.enterRoomOrTable": "Oda veya Masa Numarası Girin",
    "app.notes": "Notlar",
    "app.addNotes": "Not Ekle",
    "app.back": "Geri",
    "app.continue": "Devam",
    "app.orderConfirmation": "Sipariş Onayı",
    "app.orderSent": "Siparişiniz gönderildi!",
    "app.orderNumber": "Sipariş Numarası",
    "app.orderTime": "Sipariş Zamanı",
    "app.orderTotal": "Sipariş Toplamı",
    "app.newOrder": "Yeni Sipariş",
    "app.emptyCart": "Sepetiniz boş",
    "app.addItems": "Ürün Ekle",
    "app.add": "Ekle",
    "app.select": "Seç",
    "app.addToCart": "Sepete Ekle",
    "app.details": "Detaylar",
    "app.allergens": "Alerjenler",
    "app.reviews": "Yorumlar",
    "app.options": "Seçenekler",
    "app.portion": "Porsiyon",
    "app.allergenInfo": "Alerjen Bilgisi",
    "app.containsAllergens": "Bu üründe aşağıdaki alerjenler bulunmaktadır",
    "app.allergenWarning": "Alerjiniz varsa lütfen sipariş vermeden önce personele bildiriniz",
    "app.customerReviews": "Müşteri Yorumları",
    "app.bestSeller": "En Çok Satan",

    // Categories
    "category.all": "Tüm Menü",
    "category.breakfast": "Kahvaltı",
    "category.starters": "Başlangıçlar ve Mezeler",
    "category.salads": "Salatalar",
    "category.mainDishes": "Ana Yemekler",
    "category.pasta": "Makarnalar",
    "category.burgers": "Hamburgerler",
    "category.desserts": "Tatlılar",
    "category.drinks": "İçecekler",
    "category.spirits": "Yüksek Alkollü İçecekler",
    "category.cocktails": "Kokteyller",
    "category.beers": "Biralar",
    "category.wines": "Şaraplar",
    "category.extras": "Ekstralar",

    // Allergens
    "allergen.contains": "İçerir",
    "allergen.gluten": "Gluten",
    "allergen.dairy": "Süt Ürünleri",
    "allergen.nuts": "Kuruyemiş",
    "allergen.eggs": "Yumurta",
    "allergen.fish": "Balık",
    "allergen.shellfish": "Kabuklu Deniz Ürünleri",
    "allergen.soy": "Soya",
    "allergen.wheat": "Buğday",
    "allergen.alcohol": "Alkol",

    // Wine
    "wine.pairing": "Eşleşme",
    "wine.pairsWellWith": "Bu şarap şu yemeklerle iyi eşleşir",
    "wine.foodPairings": "Yemek Eşleşmeleri",
  },
  el: {
    // Common
    "app.name": "La Strada Restaurant",
    "app.hotel": "The Plaza Hotel Edirne",
    "app.selectLanguage": "Επιλέξτε Γλώσσα",
    "app.search": "Αναζήτηση",
    "app.cart": "Καλάθι",
    "app.menu": "Μενού",
    "app.order": "Παραγγελία",
    "app.processOrder": "Ολοκλήρωση Παραγγελίας",
    "app.orderSummary": "Σύνοψη Παραγγελίας",
    "app.subtotal": "Μερικό Σύνολο",
    "app.total": "Σύνολο",
    "app.tax": "Φόρος",
    "app.roomNumber": "Αριθμός Δωματίου",
    "app.tableNumber": "Αριθμός Τραπεζιού",
    "app.enterRoomOrTable": "Εισάγετε Αριθμό Δωματίου ή Τραπεζιού",
    "app.notes": "Σημειώσεις",
    "app.addNotes": "Προσθήκη Σημειώσεων",
    "app.back": "Πίσω",
    "app.continue": "Συνέχεια",
    "app.orderConfirmation": "Επιβεβαίωση Παραγγελίας",
    "app.orderSent": "Η παραγγελία σας έχει σταλεί!",
    "app.orderNumber": "Αριθμός Παραγγελίας",
    "app.orderTime": "Ώρα Παραγγελίας",
    "app.orderTotal": "Σύνολο Παραγγελίας",
    "app.newOrder": "Νέα Παραγγελία",
    "app.emptyCart": "Το καλάθι σας είναι άδειο",
    "app.addItems": "Προσθήκη Προϊόντων",
    "app.add": "Προσθήκη",
    "app.select": "Επιλογή",
    "app.addToCart": "Προσθήκη στο Καλάθι",
    "app.details": "Λεπτομέρειες",
    "app.allergens": "Αλλεργιογόνα",
    "app.reviews": "Κριτικές",
    "app.options": "Επιλογές",
    "app.portion": "Μερίδα",
    "app.allergenInfo": "Πληροφορίες Αλλεργιογόνων",
    "app.containsAllergens": "Αυτό το προϊόν περιέχει τα ακόλουθα αλλεργιογόνα",
    "app.allergenWarning": "Εάν έχετε αλλεργίες, παρακαλούμε ενημερώστε το προσωπικό πριν παραγγείλετε",
    "app.customerReviews": "Κριτικές Πελατών",
    "app.bestSeller": "Δημοφιλές",

    // Categories
    "category.all": "Όλο το Μενού",
    "category.breakfast": "Πρωινό",
    "category.starters": "Ορεκτικά και Μεζέδες",
    "category.salads": "Σαλάτες",
    "category.mainDishes": "Κυρίως Πιάτα",
    "category.pasta": "Ζυμαρικά",
    "category.burgers": "Μπέργκερ",
    "category.desserts": "Επιδόρπια",
    "category.drinks": "Ποτά",
    "category.spirits": "Οινοπνευματώδη Ποτά",
    "category.cocktails": "Κοκτέιλ",
    "category.beers": "Μπύρες",
    "category.wines": "Κρασιά",
    "category.extras": "Έξτρα",

    // Allergens
    "allergen.contains": "Περιέχει",
    "allergen.gluten": "Γλουτένη",
    "allergen.dairy": "Γαλακτοκομικά",
    "allergen.nuts": "Ξηροί Καρποί",
    "allergen.eggs": "Αυγά",
    "allergen.fish": "Ψάρι",
    "allergen.shellfish": "Οστρακοειδή",
    "allergen.soy": "Σόγια",
    "allergen.wheat": "Σιτάρι",
    "allergen.alcohol": "Αλκοόλ",

    // Wine
    "wine.pairing": "Συνδυασμός",
    "wine.pairsWellWith": "Αυτό το κρασί ταιριάζει καλά με",
    "wine.foodPairings": "Συνδυασμοί Φαγητού",
  },
  bg: {
    // Common
    "app.name": "La Strada Restaurant",
    "app.hotel": "The Plaza Hotel Edirne",
    "app.selectLanguage": "Изберете Език",
    "app.search": "Търсене",
    "app.cart": "Кошница",
    "app.menu": "Меню",
    "app.order": "Поръчка",
    "app.processOrder": "Завършване на Поръчката",
    "app.orderSummary": "Резюме на Поръчката",
    "app.subtotal": "Междинна Сума",
    "app.total": "Общо",
    "app.tax": "Данък",
    "app.roomNumber": "Номер на Стая",
    "app.tableNumber": "Номер на Маса",
    "app.enterRoomOrTable": "Въведете Номер на Стая или Маса",
    "app.notes": "Бележки",
    "app.addNotes": "Добавяне на Бележки",
    "app.back": "Назад",
    "app.continue": "Продължи",
    "app.orderConfirmation": "Потвърждение на Поръчката",
    "app.orderSent": "Вашата поръчка е изпратена!",
    "app.orderNumber": "Номер на Поръчка",
    "app.orderTime": "Време на Поръчка",
    "app.orderTotal": "Обща Сума",
    "app.newOrder": "Нова Поръчка",
    "app.emptyCart": "Вашата кошница е празна",
    "app.addItems": "Добавяне на Продукти",
    "app.add": "Добави",
    "app.select": "Избери",
    "app.addToCart": "Добави в Кошницата",
    "app.details": "Детайли",
    "app.allergens": "Алергени",
    "app.reviews": "Отзиви",
    "app.options": "Опции",
    "app.portion": "Порция",
    "app.allergenInfo": "Информация за Алергени",
    "app.containsAllergens": "Този продукт съдържа следните алергени",
    "app.allergenWarning": "Ако имате алергии, моля информирайте персонала преди да поръчате",
    "app.customerReviews": "Отзиви от Клиенти",
    "app.bestSeller": "Най-Продаван",

    // Categories
    "category.all": "Цялото Меню",
    "category.breakfast": "Закуска",
    "category.starters": "Предястия и Мезета",
    "category.salads": "Салати",
    "category.mainDishes": "Основни Ястия",
    "category.pasta": "Паста",
    "category.burgers": "Бургери",
    "category.desserts": "Десерти",
    "category.drinks": "Напитки",
    "category.spirits": "Високоалкохолни Напитки",
    "category.cocktails": "Коктейли",
    "category.beers": "Бира",
    "category.wines": "Вино",
    "category.extras": "Екстри",

    // Allergens
    "allergen.contains": "Съдържа",
    "allergen.gluten": "Глутен",
    "allergen.dairy": "Млечни Продукти",
    "allergen.nuts": "Ядки",
    "allergen.eggs": "Яйца",
    "allergen.fish": "Риба",
    "allergen.shellfish": "Ракообразни",
    "allergen.soy": "Соя",
    "allergen.wheat": "Пшеница",
    "allergen.alcohol": "Алкохол",

    // Wine
    "wine.pairing": "Съчетание",
    "wine.pairsWellWith": "Това вино се съчетава добре с",
    "wine.foodPairings": "Съчетания с Храна",
  },
}

// Create provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("tr") // Default to Turkish

  // Load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["en", "tr", "el", "bg"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext)
