export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { updateLeaveStatus } from '@/services/leaveService'
import { auth } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const decoded = await auth(request)
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    const leave = await updateLeaveStatus(params.id, status, decoded.userId)

    return NextResponse.json(leave)
  } catch (error) {
    console.error('Leave Update Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 