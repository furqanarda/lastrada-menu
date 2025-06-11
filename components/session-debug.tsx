"use client"

import React from "react"
import { useSession, useSessionTimeRemaining } from "@/contexts/session-context"

export default function SessionDebug() {
  const {
    sessionToken,
    sessionData,
    isValidSession,
    isSessionExpired,
    hasSessionExpiredMessage,
  } = useSession()
  const timeRemaining = useSessionTimeRemaining()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg text-xs max-w-sm z-50 border border-slate-600">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <div className="space-y-1">
        <div>Valid Session: {isValidSession ? '✅' : '❌'}</div>
        <div>Session Expired: {isSessionExpired ? '⚠️' : '✅'}</div>
        <div>Has Expired Message: {hasSessionExpiredMessage ? '⚠️' : '✅'}</div>
        <div>Time Remaining: {timeRemaining}min</div>
        {sessionData && (
          <>
            <div>Location: {sessionData.locationData.name}</div>
            <div>Token: {sessionToken?.substring(0, 20)}...</div>
            <div>Created: {new Date(sessionData.createdAt).toLocaleTimeString()}</div>
            <div>Expires: {new Date(sessionData.expiresAt).toLocaleTimeString()}</div>
          </>
        )}
      </div>
    </div>
  )
} 