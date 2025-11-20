import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有会议室
export async function GET() {
  try {
    const rooms = await prisma.meetingRoom.findMany({
      orderBy: { roomNumber: 'asc' },
    })
    return NextResponse.json({ success: true, data: rooms })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 创建会议室（初始化用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const room = await prisma.meetingRoom.create({
      data: body,
    })
    return NextResponse.json({ success: true, data: room })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

