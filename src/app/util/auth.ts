import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import api from "@/app/services/api"
import { User } from "@/app/types/User"

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

          const { token, user } = res

          api.setToken(token)

          return {
            data: user,
            token,
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
    async jwt({ token, user }) {
      if (user) {
        token.user = (user as { data: User }).data
        token.token = (user as { token: string }).token
      }

      return token
    },

    async session({ session, token }) {
      if (token.token) {
        api.setToken((token as { token: string })?.token)
      }

      ;(session as unknown as { user: User }).user = token.user as User
      ;(session as unknown as { token: string }).token = token.token as string

      return session
    },
  },
  session: {
    strategy: "jwt",
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
