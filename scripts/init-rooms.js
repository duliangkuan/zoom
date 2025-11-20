// 初始化会议室数据的脚本
// 使用方法: node scripts/init-rooms.js

const rooms = [
  { roomNumber: 1, roomName: '会议室1', capacity: 10 },
  { roomNumber: 2, roomName: '会议室2', capacity: 15 },
  { roomNumber: 3, roomName: '会议室3', capacity: 20 },
  { roomNumber: 4, roomName: '会议室4', capacity: 25 },
  { roomNumber: 5, roomName: '会议室5', capacity: 30 },
  { roomNumber: 6, roomName: '会议室6', capacity: 35 },
  { roomNumber: 7, roomName: '会议室7', capacity: 40 },
  { roomNumber: 8, roomName: '会议室8', capacity: 50 },
]

console.log('会议室数据:')
console.log(JSON.stringify(rooms, null, 2))
console.log('\n可以通过以下方式初始化:')
console.log('1. 使用API: POST /api/init-rooms')
console.log('2. 使用Prisma Studio: npm run db:studio')
console.log('3. 直接使用数据库客户端执行SQL')

