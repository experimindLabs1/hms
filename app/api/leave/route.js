export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getLeaveRequests, createLeaveRequest } from '@/services/leaveService'
import { authenticateUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const user = await authenticateUser(request)

    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get('status'),
      employeeId: searchParams.get('employeeId'),
      leaveType: searchParams.get('leaveType')
    }
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const leaves = await getLeaveRequests(filters, page, limit)

    return NextResponse.json(leaves, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Leave Request Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const user = await authenticateUser(request)

    const body = await request.json()
    const leave = await createLeaveRequest({
      ...body,
      employeeId: user.id
    })

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    console.error('Leave Creation Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message.includes('balance') ? 400 : 500 }
    )
  }
} 