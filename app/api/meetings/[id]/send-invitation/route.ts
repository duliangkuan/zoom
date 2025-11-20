import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBulkMeetingInvitations } from '@/lib/email'
import { formatDateTime } from '@/lib/utils'

// 发送会议邀请邮件
export async function POST(
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
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: '会议不存在' },
        { status: 404 }
      )
    }

    // 获取所有参会人员的邮箱和授权码
    const emails = meeting.participants
      .map(p => p.member.email)
      .filter(Boolean)

    if (emails.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有参会人员邮箱' },
        { status: 400 }
      )
    }

    // 准备成员凭证（邮箱和授权码）
    const memberCredentials = meeting.participants
      .filter(p => p.member.email && p.member.authCode)
      .map(p => ({
        email: p.member.email,
        authCode: p.member.authCode || undefined,
      }))

    // 发送邮件
    const result = await sendBulkMeetingInvitations(
      emails,
      {
        title: meeting.title,
        startTime: formatDateTime(meeting.startTime),
        endTime: formatDateTime(meeting.endTime),
        roomName: meeting.room.roomName,
        organizer: meeting.organizer.name,
        description: meeting.description || undefined,
        participants: meeting.participants.map(p => p.member.name),
      },
      memberCredentials.length > 0 ? memberCredentials : undefined
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

