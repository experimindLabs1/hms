import { NextResponse } from 'next/server'
import { getLeaveRequests, createLeaveRequest } from '@/services/leaveService'
import { auth } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await auth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const session = await auth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const leave = await createLeaveRequest({
      ...body,
      employeeId: session.user.id
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