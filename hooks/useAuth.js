import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth(requiredRole) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  
  const hasRequiredRole = !requiredRole || 
    (session?.user?.role && requiredRole.includes(session.user.role))

  if (!isLoading && !isAuthenticated) {
    router.push('/login')
    return { isLoading: true, isAuthenticated: false }
  }

  if (!isLoading && !hasRequiredRole) {
    router.push('/unauthorized')
    return { isLoading: true, isAuthenticated: true }
  }

  return {
    isLoading,
    isAuthenticated,
    user: session?.user,
    role: session?.user?.role
  }
} 