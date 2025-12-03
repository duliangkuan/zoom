import nodemailer from 'nodemailer'

// 创建邮件传输器（使用指定邮箱和授权码）
const createTransporter = (email?: string, authCode?: string) => {
  const smtpUser = email || process.env.SMTP_USER
  const smtpPass = authCode || process.env.SMTP_PASS

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP配置不完整：缺少邮箱地址或授权码')
  }

  return nodemailer.createTransport({
    host: 'smtp.139.com',
    port: 465, // 139邮箱SSL端口（官方推荐）
    secure: true, // 使用SSL加密
    auth: {
      user: smtpUser, // 139邮箱完整地址
      pass: smtpPass, // 139邮箱授权码
    },
    tls: {
      // 不验证证书（某些环境下可能需要）
      rejectUnauthorized: false,
    },
    // 添加连接超时设置
    connectionTimeout: 10000, // 10秒
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })
}

// 生成会议邀请邮件HTML模板
const generateMeetingEmailHTML = (meeting: {
  title: string
  startTime: string
  endTime: string
  roomName: string
  organizer: string
  description?: string
  participants: string[]
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .info-row {
          margin: 15px 0;
          padding: 10px;
          background: white;
          border-left: 4px solid #667eea;
          border-radius: 4px;
        }
        .label {
          font-weight: bold;
          color: #667eea;
          display: inline-block;
          width: 100px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📅 会议邀请</h1>
      </div>
      <div class="content">
        <div class="info-row">
          <span class="label">会议主题：</span>
          <span>${meeting.title}</span>
        </div>
        <div class="info-row">
          <span class="label">会议时间：</span>
          <span>${meeting.startTime} - ${meeting.endTime}</span>
        </div>
        <div class="info-row">
          <span class="label">会议室：</span>
          <span>${meeting.roomName}</span>
        </div>
        <div class="info-row">
          <span class="label">组织者：</span>
          <span>${meeting.organizer}</span>
        </div>
        ${meeting.description ? `
        <div class="info-row">
          <span class="label">会议描述：</span>
          <span>${meeting.description}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="label">参会人员：</span>
          <span>${meeting.participants.join(', ')}</span>
        </div>
        <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #666;">请准时参加本次会议，谢谢！</p>
        </div>
      </div>
      <div class="footer">
        <p>此邮件由会议室管理系统自动发送</p>
      </div>
    </body>
    </html>
  `
}

// 发送会议邀请邮件
export async function sendMeetingInvitation(
  to: string,
  meeting: {
    title: string
    startTime: string
    endTime: string
    roomName: string
    organizer: string
    description?: string
    participants: string[]
  },
  fromEmail?: string,
  authCode?: string
) {
  try {
    const transporter = createTransporter(fromEmail, authCode)
    const senderEmail = fromEmail || process.env.SMTP_USER
    
    if (!senderEmail) {
      throw new Error('发件人邮箱地址未配置')
    }

    // 验证收件人邮箱格式
    if (!to || !to.includes('@')) {
      throw new Error(`收件人邮箱地址无效: ${to}`)
    }
    
    const mailOptions = {
      from: `"会议室管理系统" <${senderEmail}>`,
      to,
      subject: `会议邀请：${meeting.title}`,
      html: generateMeetingEmailHTML(meeting),
      // 添加编码设置
      encoding: 'utf-8',
    }

    console.log(`[邮件发送] 开始发送邮件`)
    console.log(`  发件人: ${senderEmail}`)
    console.log(`  收件人: ${to}`)
    console.log(`  SMTP服务器: smtp.139.com:465 (SSL)`)
    
    // 验证SMTP连接
    await transporter.verify()
    console.log(`[邮件发送] SMTP连接验证成功`)
    
    const info = await transporter.sendMail(mailOptions)
    console.log(`[邮件发送] 邮件发送成功`)
    console.log(`  消息ID: ${info.messageId}`)
    console.log(`  响应: ${info.response}`)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    const errorDetails: any = {
      to,
      fromEmail: fromEmail || process.env.SMTP_USER,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
    }
    
    console.error('[邮件发送] 邮件发送失败:', errorDetails)
    
    // 根据错误类型提供更友好的错误信息
    let userFriendlyError = error.message || '邮件发送失败，请检查SMTP配置'
    
    if (error.code === 'EAUTH') {
      userFriendlyError = 'SMTP认证失败，请检查邮箱地址和授权码是否正确'
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      userFriendlyError = '无法连接到SMTP服务器，请检查网络连接和服务器地址'
    } else if (error.code === 'EENVELOPE') {
      userFriendlyError = '邮件地址格式错误，请检查收件人邮箱地址'
    }
    
    return { 
      success: false, 
      error: userFriendlyError,
      details: error.code ? `错误代码: ${error.code}` : undefined,
      fullError: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }
  }
}

// 批量发送会议邀请
export async function sendBulkMeetingInvitations(
  emails: string[],
  meeting: {
    title: string
    startTime: string
    endTime: string
    roomName: string
    organizer: string
    description?: string
    participants: string[]
  },
  memberCredentials?: Array<{ email: string; authCode?: string }>
) {
  // 如果提供了成员凭证，优先使用第一个（通常是组织者的配置）
  // 如果没有提供，则使用环境变量或默认配置
  const defaultCredentials = memberCredentials && memberCredentials.length > 0 
    ? memberCredentials[0] 
    : undefined

  const results = await Promise.allSettled(
    emails.map((email, index) => {
      // 查找对应的授权码（按收件人邮箱匹配）
      // 如果找不到，使用默认配置（通常是组织者的配置）
      const credentials = memberCredentials?.find(m => m.email === email) || defaultCredentials
      return sendMeetingInvitation(
        email, 
        meeting,
        credentials?.email,
        credentials?.authCode
      )
    })
  )

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failCount = results.length - successCount

  return {
    total: emails.length,
    success: successCount,
    failed: failCount,
    results: results.map((r, i) => ({
      email: emails[i],
      ...(r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }),
    })),
  }
}

