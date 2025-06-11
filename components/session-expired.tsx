"use client"

import React from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw, QrCode } from "lucide-react"
import { motion } from "framer-motion"

interface SessionExpiredProps {
  onDismiss: () => void
  className?: string
}

export default function SessionExpired({ onDismiss, className = "" }: SessionExpiredProps) {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 ${className}`}
    >
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 text-center border-b border-slate-700/50">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4"
          >
            <Clock className="w-8 h-8 text-orange-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t("session.expired")}
          </h1>
          <p className="text-slate-300 text-sm">
            {t("session.expiredDescription")}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Session Info */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <QrCode className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {t("session.securityInfo")}
                </h3>
                <p className="text-sm text-slate-400">
                  {t("session.sessionDuration")}
                </p>
              </div>
            </div>
            <div className="bg-slate-600/30 rounded-md p-3">
              <p className="text-sm text-slate-300">
                {t("session.expiredExplanation")}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("session.howToContinue")}
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-sm text-slate-300">
                  {t("session.step1")}
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-sm text-slate-300">
                  {t("session.step2")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onDismiss}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 transition-all duration-200 border-0"
          >
            {t("session.understood")}
          </Button>

          {/* Contact Info */}
          <div className="text-center pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">
              {t("session.needHelp")} {" "}
              <span className="text-blue-400 font-medium">
                {t("app.contactReception")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 