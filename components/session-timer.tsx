"use client"

import React from "react"
import { useSession, useSessionTimeRemaining } from "@/contexts/session-context"
import { useLanguage } from "@/contexts/language-context"
import { Clock } from "lucide-react"

interface SessionTimerProps {
  className?: string
}

export default function SessionTimer({ className = "" }: SessionTimerProps) {
  const { isValidSession } = useSession()
  const timeRemaining = useSessionTimeRemaining()
  const { t } = useLanguage()

  // Don't show timer if no valid session
  if (!isValidSession || timeRemaining <= 0) {
    return null
  }

  // Show warning when less than 30 minutes remain
  const isWarning = timeRemaining <= 30
  const hours = Math.floor(timeRemaining / 60)
  const minutes = timeRemaining % 60

  const formatTime = () => {
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${
      isWarning ? 'text-orange-400' : 'text-slate-400'
    } ${className}`}>
      <Clock className="w-4 h-4" />
      <span>
        Session: {formatTime()}
      </span>
    </div>
  )
} 