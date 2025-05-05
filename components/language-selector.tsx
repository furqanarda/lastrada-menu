"use client"

import { useLanguage, type Language } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "bg", name: "Български", flag: "🇧🇬" },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const router = useRouter()

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang)
    // Navigate to menu after language selection
    setTimeout(() => {
      router.push("/menu")
    }, 500)
  }

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {languages.map((lang) => (
        <motion.div
          key={lang.code}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: languages.indexOf(lang) * 0.1 }}
        >
          <Button
            variant={language === lang.code ? "default" : "outline"}
            className={`w-full h-20 text-lg flex flex-col items-center justify-center gap-2 rounded-xl ${
              language === lang.code
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-[#1a2234] border-[#2a3346] text-white hover:bg-[#2a3346]"
            }`}
            onClick={() => handleLanguageSelect(lang.code as Language)}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span>{lang.name}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
