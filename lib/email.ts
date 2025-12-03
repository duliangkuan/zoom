import nodemailer from 'nodemailer'

// 创建邮件传输器（使用指定邮箱和授权码）
const createTransporter = (email?: string, authCode?: string) => {
  return nodemailer.createTransport({
    host: 'smtp.139.com',
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: email || process.env.SMTP_USER, // 139邮箱
      pass: authCode || process.env.SMTP_PASS, // 139邮箱授权码
    },
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
    const senderEmail = fromEmail || process.env.SMTP_USER || 'noreply@example.com'
    
    const mailOptions = {
      from: `"会议室管理系统" <${senderEmail}>`,
      to,
      subject: `会议邀请：${meeting.title}`,
      html: generateMeetingEmailHTML(meeting),
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('邮件发送失败:', error)
    return { success: false, error: error.message }
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

