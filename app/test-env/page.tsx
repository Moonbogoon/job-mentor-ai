"use client"

import { useEffect, useState } from "react"

export default function TestEnv() {
  const [envVars, setEnvVars] = useState<{
    supabaseUrl: string | undefined
    supabaseAnonKey: string | undefined
  }>({
    supabaseUrl: undefined,
    supabaseAnonKey: undefined,
  })

  useEffect(() => {
    setEnvVars({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900">Environment Variables Test</h2>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Supabase URL:</p>
            <p className="text-sm text-gray-600 break-all">
              {envVars.supabaseUrl || "Not set"}
            </p>
          </div>
          <div>
            <p className="font-medium">Supabase Anon Key:</p>
            <p className="text-sm text-gray-600 break-all">
              {envVars.supabaseAnonKey ? "Set (hidden for security)" : "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 