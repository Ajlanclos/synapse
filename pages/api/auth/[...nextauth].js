import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Include email in the session so we can check subscriptions
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
