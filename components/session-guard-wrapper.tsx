"use client"

import React, { Suspense } from "react"
import SessionGuard from "./session-guard"

interface SessionGuardWrapperProps {
  children: React.ReactNode
}

const SessionGuardFallback = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-white text-lg">Initializing...</div>
    </div>
  )
}

export default function SessionGuardWrapper({ children }: SessionGuardWrapperProps) {
  return (
    <Suspense fallback={<SessionGuardFallback>{children}</SessionGuardFallback>}>
      <SessionGuard>{children}</SessionGuard>
    </Suspense>
  )
} 