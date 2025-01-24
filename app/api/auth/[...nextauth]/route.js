import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const handler = NextAuth(authOptions)

// Add debug logs
console.log('NextAuth handler initialized'); // Debug log

export { handler as GET, handler as POST } 