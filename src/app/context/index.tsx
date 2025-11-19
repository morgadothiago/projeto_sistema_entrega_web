"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "../types/User"
import type { AuthContextType } from "../types/AuthContextType"
import { getSession } from "next-auth/react"
import { logger } from "@/lib/logger"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // 👈 novo estado

  useEffect(() => {
    let isMounted = true

    const fetchSession = async () => {
      try {
        logger.debug("Fetching session...")
        const data = await getSession()

        if (data && isMounted) {
          setUser(data.user as unknown as User)

          const sessionToken = (data as unknown as { token?: string })?.token

          if (sessionToken) {
            setToken(sessionToken)
            logger.debug("Session token set successfully")
          } else {
            logger.warn("Token not found in session")
          }
        } else if (!data) {
          logger.warn("Session not available")
        }
      } catch (error) {
        logger.error("Error fetching session", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSession()

    return () => {
      isMounted = false
    }
  }, [])

  const isAuthenticated = (): boolean => {
    return !!token
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, setToken, token, isAuthenticated, loading }} // 👈 exporta loading
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
