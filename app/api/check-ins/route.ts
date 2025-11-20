import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isLate } from '@/lib/utils'

// 提交签到
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingId, memberId } = body

    if (!meetingId || !memberId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 检查是否为参会人员
    const participant = await prisma.meetingParticipant.findUnique({
      where: {
        meetingId_memberId: {
          meetingId,
          memberId,
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { success: false, error: '您不是本次会议的参会人员' },
        { status: 403 }
      )
    }

    // 检查是否已签到
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: {
        meetingId_memberId: {
          meetingId,
          memberId,
        },
      },
    })

    if (existingCheckIn) {
      return NextResponse.json(
        { success: false, error: '您已经签到过了' },
        { status: 400 }
      )
    }

    // 获取会议信息
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    })

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: '会议不存在' },
        { status: 404 }
      )
    }

    // 判断是否迟到
    const checkInTime = new Date()
    const status = isLate(checkInTime, meeting.startTime) ? 'late' : 'normal'

    // 创建签到记录
    const checkIn = await prisma.checkIn.create({
      data: {
        meetingId,
        memberId,
        checkInTime,
        status,
      },
      include: {
        member: true,
        meeting: {
          include: {
            room: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: checkIn })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: '您已经签到过了' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 获取签到记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('meetingId')

    const where: any = {}
    if (meetingId) {
      where.meetingId = parseInt(meetingId)
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: {
        member: true,
        meeting: {
          include: {
            room: true,
          },
        },
      },
      orderBy: { checkInTime: 'desc' },
    })

    return NextResponse.json({ success: true, data: checkIns })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

