import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyUserCredentials } from '../../../lib/supabase'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const valid = await verifyUserCredentials(credentials.email, credentials.password)
        if (!valid) return null
        return { id: credentials.email, email: credentials.email, name: credentials.email.split('@')[0] }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  callbacks: {
    async session({ session, token }) {
      session.user.email = token.email
      return session
    },
    async jwt({ token, user }) {
      if (user) token.email = user.email
      return token
    },
  },
}

export default NextAuth(authOptions)
