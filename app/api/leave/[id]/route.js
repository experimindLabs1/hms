import { NextResponse } from 'next/server'
import { updateLeaveStatus } from '@/services/leaveService'
import { auth } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const session = await auth(request)
    if (!session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    const leave = await updateLeaveStatus(params.id, status, session.user.id)

    return NextResponse.json(leave)
  } catch (error) {
    console.error('Leave Update Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 