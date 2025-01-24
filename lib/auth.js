import { getServerSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './db'
import bcrypt from 'bcryptjs'

export const authOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Authorize function called with email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
          }
        })

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
          throw new Error('No user found')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        console.log('Password valid:', isValid);

        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user });
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
}

export const getServerAuthSession = () => getServerSession(authOptions) 