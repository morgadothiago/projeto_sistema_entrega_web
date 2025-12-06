import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import api from "@/app/services/api"
import { User } from "@/app/types/User"

/**
 * Função para renovar o access token usando o refresh token
 */
async function refreshAccessToken(token: any) {
  try {
    console.log("🔄 Tentando renovar access token...")

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: token.refreshToken
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      console.error("❌ Falha ao renovar token:", refreshedTokens)
      throw refreshedTokens
    }

    console.log("✅ Token renovado com sucesso!")

    return {
      ...token,
      accessToken: refreshedTokens.token || refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + (refreshedTokens.expiresIn || 3600) * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
      user: token.user,
    }
  } catch (error) {
    console.error("❌ Erro ao renovar token:", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: NextAuthConfig = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>
      ) {
        if (!credentials) {
          return null
        }

        try {
          if (!credentials) {
            return null
          }

          const res = await api.login(
            credentials.email as string,
            credentials.password as string
          )

          if ("status" in res) return null

          const { token, user, refreshToken, expiresIn } = res as any

          api.setToken(token)

          return {
            data: user,
            token,
            refreshToken: refreshToken || null,
            expiresIn: expiresIn || 3600,
            id: user.id.toString(), // Ensure the 'id' is a string as required by next-auth
          }
        } catch {
          //console.error("Authorization error:", error);
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Login inicial - salvar tokens e tempo de expiração
      if (user) {
        console.log("🔐 Login inicial - salvando tokens")
        const expiresIn = (user as any).expiresIn || 3600

        return {
          ...token,
          user: (user as { data: User }).data,
          accessToken: (user as { token: string }).token,
          refreshToken: (user as any).refreshToken,
          accessTokenExpires: Date.now() + expiresIn * 1000,
        }
      }

      // Token ainda válido - retornar sem mudanças
      const tokenExpires = (token as any).accessTokenExpires || 0
      if (Date.now() < tokenExpires) {
        console.log("✅ Token ainda válido")
        return token
      }

      // Token expirou - tentar renovar
      console.log("⏰ Token expirou - iniciando renovação")
      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      // Verificar se houve erro ao renovar token
      if ((token as any).error === "RefreshAccessTokenError") {
        console.error("❌ Erro de refresh token detectado na sessão")
        return {
          ...session,
          error: "RefreshAccessTokenError",
        } as any
      }

      if ((token as any).accessToken) {
        api.setToken((token as any).accessToken)
      }

      ; (session as unknown as { user: User }).user = token.user as User
        ; (session as unknown as { token: string }).token = (token as any).accessToken
        ; (session as any).error = (token as any).error

      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  },
  pages: {
    signIn: "/signin", // Página de login personalizada
    error: "/signin", // Redireciona erros de volta para o login
  },
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions)
