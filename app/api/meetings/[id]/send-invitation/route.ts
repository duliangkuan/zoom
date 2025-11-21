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

    // 获取所有参会人员的邮箱
    const emails = meeting.participants
      .map(p => p.member.email)
      .filter(Boolean)

    if (emails.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有参会人员邮箱' },
        { status: 400 }
      )
    }

    // 使用组织者的邮箱和授权码发送邮件（如果组织者有配置）
    // 如果没有配置，则使用每个参会人员自己的邮箱配置作为后备
    const organizerEmail = meeting.organizer.email
    const organizerAuthCode = meeting.organizer.authCode

    // 如果组织者有邮箱和授权码，使用组织者的配置统一发送
    // 否则使用每个参会人员自己的邮箱配置
    let memberCredentials: Array<{ email: string; authCode?: string }> | undefined

    if (organizerEmail && organizerAuthCode) {
      // 使用组织者的邮箱配置发送给所有参会人员
      // 第一个元素是组织者的配置，作为默认配置
      memberCredentials = [
        {
          email: organizerEmail,
          authCode: organizerAuthCode,
        },
        // 为每个收件人创建映射（如果收件人自己的邮箱配置存在，会优先使用）
        ...meeting.participants
          .filter(p => p.member.email && p.member.authCode && p.member.email !== organizerEmail)
          .map(p => ({
            email: p.member.email,
            authCode: p.member.authCode || undefined,
          })),
      ]
    } else {
      // 使用每个参会人员自己的邮箱配置作为后备
      memberCredentials = meeting.participants
        .filter(p => p.member.email && p.member.authCode)
        .map(p => ({
          email: p.member.email,
          authCode: p.member.authCode || undefined,
        }))
      memberCredentials = memberCredentials.length > 0 ? memberCredentials : undefined
    }

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
      memberCredentials
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

