// 确保环境变量被正确加载
if (typeof window === 'undefined') {
  // 服务器端：确保环境变量已加载
  require('dotenv').config({ path: '.env.local' })
}

export const DATABASE_URL = process.env.DATABASE_URL
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL 环境变量未设置！')
  console.error('请确保 .env.local 文件存在并包含 DATABASE_URL')
}


