import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取会议详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        room: true,
        organizer: true,
        participants: {
          include: {
            member: true,
          },
        },
        checkIns: {
          include: {
            member: true,
          },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: '会议不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: meeting })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 更新会议
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const meeting = await prisma.meeting.update({
      where: { id: parseInt(params.id) },
      data: body,
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

// 取消会议
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.update({
      where: { id: parseInt(params.id) },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true, data: meeting })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

