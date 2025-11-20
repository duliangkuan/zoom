'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Space, message } from 'antd'
import { generateTimeSlots } from '@/lib/utils'
import dayjs from 'dayjs'

interface TimeSlotPickerProps {
  date: string
  roomId: number
  selectedStartTime?: string
  selectedEndTime?: string
  onTimeSelect: (startTime: string, endTime: string) => void
}

export default function TimeSlotPicker({
  date,
  roomId,
  selectedStartTime,
  selectedEndTime,
  onTimeSelect,
}: TimeSlotPickerProps) {
  const [bookedSlots, setBookedSlots] = useState<Array<{ startTime: Date; endTime: Date }>>([])
  const [selectingStart, setSelectingStart] = useState<string | null>(null)
  const slots = generateTimeSlots()

  useEffect(() => {
    if (date && roomId) {
      fetch(`/api/rooms/${roomId}/availability?date=${date}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBookedSlots(data.data.bookedSlots)
          }
        })
        .catch(err => {
          console.error('获取可用时间段失败:', err)
        })
    }
  }, [date, roomId])

  const isSlotBooked = (slot: string) => {
    const slotTime = dayjs(`${date} ${slot}`)
    return bookedSlots.some(booked => {
      const start = dayjs(booked.startTime)
      const end = dayjs(booked.endTime)
      return slotTime.isAfter(start) && slotTime.isBefore(end) || slotTime.isSame(start)
    })
  }

  const isSlotSelected = (slot: string) => {
    if (!selectedStartTime || !selectedEndTime) return false
    const slotTime = dayjs(`${date} ${slot}`)
    const start = dayjs(`${date} ${selectedStartTime}`)
    const end = dayjs(`${date} ${selectedEndTime}`)
    return slotTime.isAfter(start) && slotTime.isBefore(end) || slotTime.isSame(start) || slotTime.isSame(end)
  }

  const handleSlotClick = (slot: string) => {
    if (isSlotBooked(slot)) {
      message.warning('该时间段已被预约')
      return
    }

    if (!selectingStart) {
      // 选择开始时间
      setSelectingStart(slot)
    } else {
      // 选择结束时间
      const start = dayjs(`${date} ${selectingStart}`)
      const end = dayjs(`${date} ${slot}`)
      
      if (end.isBefore(start) || end.isSame(start)) {
        message.warning('结束时间必须晚于开始时间')
        setSelectingStart(null)
        return
      }

      // 计算时间差（分钟）
      const diffMinutes = end.diff(start, 'minute')
      
      // 验证时间间隔是否为30分钟的倍数
      if (diffMinutes % 30 !== 0) {
        message.warning('会议时间必须以30分钟为单位，请选择整点或半点时间')
        setSelectingStart(null)
        return
      }

      // 检查中间是否有已预约的时间段
      let hasConflict = false
      for (let i = 0; i < slots.length; i++) {
        const currentSlot = slots[i]
        const slotTime = dayjs(`${date} ${currentSlot}`)
        if (slotTime.isAfter(start) && slotTime.isBefore(end) && isSlotBooked(currentSlot)) {
          hasConflict = true
          break
        }
      }

      if (hasConflict) {
        message.warning('选择的时间段中包含已预约的时间')
        setSelectingStart(null)
        return
      }

      onTimeSelect(selectingStart, slot)
      setSelectingStart(null)
    }
  }

  const getSlotStatus = (slot: string) => {
    if (isSlotBooked(slot)) return 'booked'
    if (selectingStart === slot) return 'selecting'
    if (isSlotSelected(slot)) return 'selected'
    return 'available'
  }

  return (
    <Card title="选择时间段" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {slots.map(slot => {
          const status = getSlotStatus(slot)
          let buttonType: 'default' | 'primary' | 'dashed' = 'default'
          let disabled = false

          if (status === 'booked') {
            buttonType = 'default'
            disabled = true
          } else if (status === 'selecting' || status === 'selected') {
            buttonType = 'primary'
          }

          return (
            <Button
              key={slot}
              type={buttonType}
              disabled={disabled}
              onClick={() => handleSlotClick(slot)}
              style={{
                minWidth: '80px',
                opacity: status === 'booked' ? 0.5 : 1,
              }}
            >
              {slot}
            </Button>
          )
        })}
      </div>
      {selectingStart && (
        <div style={{ marginTop: '16px', color: '#1890ff' }}>
          已选择开始时间: {selectingStart}，请选择结束时间
        </div>
      )}
      {selectedStartTime && selectedEndTime && (
        <div style={{ marginTop: '16px', color: '#52c41a', fontWeight: 'bold' }}>
          已选择: {selectedStartTime} - {selectedEndTime}
        </div>
      )}
    </Card>
  )
}

