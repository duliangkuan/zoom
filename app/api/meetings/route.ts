import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTimeSlotConflict, isValidTimeInterval } from '@/lib/utils'

// 获取会议列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: any = {}
    if (roomId) where.roomId = parseInt(roomId)
    if (status) where.status = status
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        room: true,
        organizer: true,
        participants: {
          include: {
            member: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({ success: true, data: meetings })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 创建会议预约
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, title, startTime, endTime, organizerId, description, participantIds } = body

    // 验证必填字段
    if (!roomId || !title || !startTime || !endTime || !organizerId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    // 验证时间
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: '结束时间必须晚于开始时间' },
        { status: 400 }
      )
    }

    // 验证时间间隔是否为30分钟的倍数
    if (!isValidTimeInterval(start, end)) {
      return NextResponse.json(
        { success: false, error: '会议时间必须以30分钟为单位，且开始和结束时间必须是整点或半点' },
        { status: 400 }
      )
    }

    // 检查时间段冲突
    const conflictingMeetings = await prisma.meeting.findMany({
      where: {
        roomId,
        status: 'scheduled',
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start },
          },
        ],
      },
    })

    if (conflictingMeetings.length > 0) {
      return NextResponse.json(
        { success: false, error: '该时间段已被预约' },
        { status: 400 }
      )
    }

    // 创建会议
    const meeting = await prisma.meeting.create({
      data: {
        roomId,
        title,
        startTime: start,
        endTime: end,
        organizerId,
        description,
        participants: {
          create: (participantIds || []).map((memberId: number) => ({
            memberId,
            status: 'invited',
          })),
        },
      },
      include: {
        room: true,
        organizer: true,
        participants: {
          include: {
            member: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: meeting })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

