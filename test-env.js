// 测试环境变量配置
require('dotenv').config({ path: '.env.local' })

console.log('=== 环境变量测试 ===')
console.log('DATABASE_URL:', process.env.DATABASE_URL || '❌ 未设置')
console.log('SMTP_USER:', process.env.SMTP_USER || '❌ 未设置')
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ 已设置' : '❌ 未设置')

if (process.env.DATABASE_URL) {
  console.log('\n✅ DATABASE_URL 配置成功！')
  console.log('数据库类型:', process.env.DATABASE_URL.startsWith('file:') ? 'SQLite' : 'PostgreSQL')
} else {
  console.log('\n❌ DATABASE_URL 未配置！')
  console.log('请检查 .env.local 文件是否存在且包含 DATABASE_URL')
}


