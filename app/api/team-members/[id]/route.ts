import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 更新团队成员
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, authCode, department, position } = body
    
    const updateData: any = {
      name,
      email,
      department,
      position,
    }
    
    // 如果提供了授权码，则更新
    if (authCode !== undefined) {
      updateData.authCode = authCode || null
    }
    
    const member = await prisma.teamMember.update({
      where: { id: parseInt(params.id) },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: member })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 删除团队成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.teamMember.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

