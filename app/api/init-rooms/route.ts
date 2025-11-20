import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 初始化8个会议室（仅用于开发/初始化）
export async function POST() {
  try {
    // 检查是否已有会议室
    const existingRooms = await prisma.meetingRoom.count()
    if (existingRooms > 0) {
      // 如果已有会议室，先删除再重新创建
      await prisma.meetingRoom.deleteMany({})
    }

    // 创建8个会议室（使用中文数字命名）
    const rooms = await prisma.meetingRoom.createMany({
      data: [
        { roomNumber: 1, roomName: '会议室一', capacity: 10 },
        { roomNumber: 2, roomName: '会议室二', capacity: 15 },
        { roomNumber: 3, roomName: '会议室三', capacity: 20 },
        { roomNumber: 4, roomName: '会议室四', capacity: 25 },
        { roomNumber: 5, roomName: '会议室五', capacity: 30 },
        { roomNumber: 6, roomName: '会议室六', capacity: 35 },
        { roomNumber: 7, roomName: '会议室七', capacity: 40 },
        { roomNumber: 8, roomName: '会议室八', capacity: 50 },
      ],
    })

    return NextResponse.json({
      success: true,
      message: '会议室初始化成功',
      data: rooms,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

