import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { User } from "@/app/types/User"
import apiService from "../services/api"

interface TokenData {
  user: User
  accessToken: string
  refreshToken?: string
  accessTokenExpires: number
  error?: string
}

/**
 * Função para renovar o access token usando o refresh token
 */
let refreshTokenPromise: Promise<TokenData> | null = null
let lastRefreshAttempt = 0
const MIN_REFRESH_INTERVAL = 1000

async function refreshAccessToken(token: TokenData): Promise<TokenData> {
  try {
    const now = Date.now()

    if (refreshTokenPromise) {
      return refreshTokenPromise
    }

    if (now - lastRefreshAttempt < MIN_REFRESH_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REFRESH_INTERVAL))
    }

    lastRefreshAttempt = now

    const apiHost = "https://api.quicktecnologia.com"

    refreshTokenPromise = fetch(`${apiHost}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: token.refreshToken
      }),
    }).then(async (response) => {
      const refreshedTokens = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          throw { ...refreshedTokens, isRateLimit: true }
        }
        throw refreshedTokens
      }

      return {
        ...token,
        accessToken: refreshedTokens.token || refreshedTokens.accessToken || token.accessToken,
        accessTokenExpires: Date.now() + (refreshedTokens.expiresIn || 3600) * 1000,
        refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
        user: token.user,
      }
    }).finally(() => {
      refreshTokenPromise = null
    })

    return refreshTokenPromise
  } catch (error) {
    refreshTokenPromise = null
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await apiService.login(
            credentials.email as string,
            credentials.password as string
          )

          // Type guard to check if response is an error
          if ('status' in response && response.status >= 400) {
            const errorResponse = response as any

            // Handle Cloudflare/Server Down errors specifically
            if (response.status === 521 || response.status === 523) {
              throw new Error("Servidor offline (521). Tente novamente mais tarde.");
            }
            if (response.status === 520 || response.status === 522 || response.status === 524) {
              throw new Error("Erro de conexão com o servidor (Timeout/Unreachable).");
            }

            // ApiService returns { status, message, data } on error
            if (errorResponse.message) {
              // Extract pure message if it's "Request failed..."
              if (errorResponse.message.includes("Request failed with status code")) {
                throw new Error(`Erro na API (${errorResponse.status})`);
              }

              throw new Error(JSON.stringify({
                status: 'ERROR',
                message: errorResponse.message
              }))
            }
            throw new Error(errorResponse.message || "Falha na autenticação")
          }

          // Successful login
          const loginData = response as any // Cast because ILoginResponse might be incomplete effectively
          const { token, user, refreshToken, expiresIn } = loginData

          if (!token || !user) {
            return null
          }

          return {
            data: user,
            token,
            refreshToken: refreshToken || null,
            expiresIn: expiresIn || 3600,
            id: user.id.toString(),
          }

        } catch (error) {
          // Sempre relança o erro para que o login.ts possa capturar a mensagem correta
          // O NextAuth vai envolver isso em um CallbackRouteError, que já estamos tratando no login.ts
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Login inicial
      if (user) {
        const userWithTokens = user as {
          data: User
          token: string
          refreshToken?: string
          expiresIn?: number
        }
        const expiresIn = userWithTokens.expiresIn || 3600

        return {
          ...token,
          user: userWithTokens.data,
          accessToken: userWithTokens.token,
          refreshToken: userWithTokens.refreshToken,
          accessTokenExpires: Date.now() + expiresIn * 1000,
        } as any
      }

      // Token ainda válido
      const tokenData = token as unknown as TokenData
      const tokenExpires = tokenData.accessTokenExpires || 0
      if (Date.now() < tokenExpires) {
        return token
      }

      // Token expirou - renovar
      return refreshAccessToken(tokenData) as any
    },

    async session({ session, token }) {
      const tokenData = token as unknown as TokenData

      if (tokenData.error === "RefreshAccessTokenError") {
        return {
          ...session,
          error: "RefreshAccessTokenError",
        }
      }

      const sessionWithData = session as typeof session & {
        user: User
        token: string
        error?: string
      }

      sessionWithData.user = tokenData.user as any
      sessionWithData.token = tokenData.accessToken
      sessionWithData.error = tokenData.error

      return sessionWithData
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions)
