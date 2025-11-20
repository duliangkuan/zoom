import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取会议室在指定日期的可用时间段
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: '缺少日期参数' },
        { status: 400 }
      )
    }

    const roomId = parseInt(params.id)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // 查询该日期已预约的会议
    const bookedMeetings = await prisma.meeting.findMany({
      where: {
        roomId,
        status: 'scheduled',
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        bookedSlots: bookedMeetings,
        date,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

