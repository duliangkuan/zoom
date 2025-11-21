import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 设置默认时区为中国时区
dayjs.tz.setDefault('Asia/Shanghai')

// 生成30分钟时间段数组
export function generateTimeSlots() {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

// 格式化日期时间
export function formatDateTime(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 格式化日期
export function formatDate(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化时间
export function formatTime(date: Date | string): string {
  return dayjs(date).format('HH:mm')
}

// 检查时间段是否冲突
export function isTimeSlotConflict(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2
}

// 将日期和时间字符串组合成Date对象
export function combineDateTime(date: string, time: string): Date {
  return dayjs(`${date} ${time}`).toDate()
}

// 获取会议状态
export function getMeetingStatus(meeting: { startTime: Date; endTime: Date; status: string }) {
  if (meeting.status === 'cancelled') return '已取消'
  if (meeting.status === 'completed') return '已完成'
  
  const now = new Date()
  if (now < meeting.startTime) return '即将开始'
  if (now >= meeting.startTime && now <= meeting.endTime) return '进行中'
  return '已结束'
}

// 判断是否迟到（签到时间晚于会议开始时间）
export function isLate(checkInTime: Date, meetingStartTime: Date): boolean {
  return dayjs(checkInTime).isAfter(dayjs(meetingStartTime))
}

// 验证时间是否为30分钟的倍数
export function isValidTimeSlot(time: Date | string): boolean {
  const date = dayjs(time)
  const minutes = date.minute()
  return minutes === 0 || minutes === 30
}

// 验证时间间隔是否为30分钟的倍数
export function isValidTimeInterval(startTime: Date | string, endTime: Date | string): boolean {
  const start = dayjs(startTime)
  const end = dayjs(endTime)
  
  // 检查开始和结束时间是否为30分钟的倍数
  if (!isValidTimeSlot(start.toDate()) || !isValidTimeSlot(end.toDate())) {
    return false
  }
  
  // 计算时间差（分钟）
  const diffMinutes = end.diff(start, 'minute')
  
  // 时间差必须是30分钟的倍数且大于0
  return diffMinutes > 0 && diffMinutes % 30 === 0
}

