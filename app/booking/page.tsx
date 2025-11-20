'use client'

import { useState, useEffect } from 'react'
import { Layout, Card, Form, Input, Select, DatePicker, Button, message, Space, Menu } from 'antd'
import { CalendarOutlined, TeamOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dayjs, { Dayjs } from 'dayjs'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { combineDateTime, formatDateTime } from '@/lib/utils'

const { Header, Content, Footer } = Layout
const { TextArea } = Input

interface MeetingRoom {
  id: number
  roomNumber: number
  roomName: string
  capacity: number
}

interface TeamMember {
  id: number
  name: string
  email: string
}

export default function BookingPage() {
  const [form] = Form.useForm()
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [selectedStartTime, setSelectedStartTime] = useState<string>('')
  const [selectedEndTime, setSelectedEndTime] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 获取会议室列表
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRooms(data.data)
          if (data.data.length > 0) {
            setSelectedRoomId(data.data[0].id)
            form.setFieldsValue({ roomId: data.data[0].id })
          } else {
            message.warning('暂无会议室数据，请先初始化会议室')
          }
        } else {
          message.error('获取会议室列表失败: ' + (data.error || '未知错误'))
        }
      })
      .catch(err => {
        console.error('获取会议室列表失败:', err)
        message.error('获取会议室列表失败，请检查网络连接')
      })

    // 获取团队成员列表
    fetch('/api/team-members')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembers(data.data)
        }
      })
      .catch(err => {
        console.error('获取团队成员列表失败:', err)
      })
  }, [form])

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'))
      form.setFieldsValue({ date: date })
    }
  }

  const handleRoomChange = (roomId: number) => {
    setSelectedRoomId(roomId)
    setSelectedStartTime('')
    setSelectedEndTime('')
  }

  const handleTimeSelect = (startTime: string, endTime: string) => {
    setSelectedStartTime(startTime)
    setSelectedEndTime(endTime)
    const startDateTime = combineDateTime(selectedDate, startTime)
    const endDateTime = combineDateTime(selectedDate, endTime)
    form.setFieldsValue({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    })
  }

  const handleSubmit = async (values: any) => {
    if (!selectedStartTime || !selectedEndTime) {
      message.warning('请选择会议时间段')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          startTime: combineDateTime(selectedDate, selectedStartTime).toISOString(),
          endTime: combineDateTime(selectedDate, selectedEndTime).toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        message.success('会议预约成功！')
        form.resetFields()
        setSelectedStartTime('')
        setSelectedEndTime('')
        
        // 询问是否发送邀请
        const shouldSend = confirm('是否立即发送会议邀请邮件？')
        if (shouldSend && data.data.id) {
          await sendInvitation(data.data.id)
        }
      } else {
        message.error(data.error || '预约失败')
      }
    } catch (error: any) {
      message.error('预约失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async (meetingId: number) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/send-invitation`, {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        message.success(`邀请邮件已发送！成功: ${data.data.success}, 失败: ${data.data.failed}`)
      } else {
        message.error('发送邀请失败: ' + data.error)
      }
    } catch (error: any) {
      message.error('发送邀请失败: ' + error.message)
    }
  }

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link href="/">首页</Link>,
    },
    {
      key: 'booking',
      icon: <CalendarOutlined />,
      label: <Link href="/booking">会议预约</Link>,
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      label: <Link href="/team-members">团队成员</Link>,
    },
    {
      key: 'checkin',
      icon: <CheckCircleOutlined />,
      label: <Link href="/check-in">会议签到</Link>,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginRight: '40px' }}>
          会议室管理系统
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['booking']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card title="会议预约">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                date: dayjs(),
              }}
            >
              <Form.Item
                name="roomId"
                label="选择会议室"
                rules={[{ required: true, message: '请选择会议室' }]}
              >
                <Select
                  placeholder={rooms.length === 0 ? "暂无会议室，请先初始化" : "请选择会议室"}
                  onChange={handleRoomChange}
                  disabled={rooms.length === 0}
                  notFoundContent={rooms.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ marginBottom: '16px' }}>暂无会议室数据</p>
                      <Button 
                        type="primary" 
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/init-rooms', { method: 'POST' })
                            const data = await res.json()
                            if (data.success) {
                              message.success('会议室初始化成功！')
                              // 重新获取会议室列表
                              const roomsRes = await fetch('/api/rooms')
                              const roomsData = await roomsRes.json()
                              if (roomsData.success) {
                                setRooms(roomsData.data)
                                if (roomsData.data.length > 0) {
                                  setSelectedRoomId(roomsData.data[0].id)
                                  form.setFieldsValue({ roomId: roomsData.data[0].id })
                                }
                              }
                            } else {
                              message.error(data.error || '初始化失败')
                            }
                          } catch (err: any) {
                            message.error('初始化失败: ' + err.message)
                          }
                        }}
                      >
                        点击初始化8个会议室
                      </Button>
                      <div style={{ marginTop: '12px' }}>
                        <Link href="/init" style={{ fontSize: '12px', color: '#1890ff' }}>
                          或前往初始化页面
                        </Link>
                      </div>
                    </div>
                  ) : undefined}
                >
                  {rooms.map(room => (
                    <Select.Option key={room.id} value={room.id}>
                      {room.roomName} (容量: {room.capacity}人)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="选择日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              {selectedRoomId && selectedDate && (
                <TimeSlotPicker
                  date={selectedDate}
                  roomId={selectedRoomId}
                  selectedStartTime={selectedStartTime}
                  selectedEndTime={selectedEndTime}
                  onTimeSelect={handleTimeSelect}
                />
              )}

              {!selectedRoomId && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: '4px', color: '#d46b08' }}>
                  ⚠️ 请先选择会议室，然后选择日期，即可选择时间段（以30分钟为单位）
                </div>
              )}

              <Form.Item
                name="title"
                label="会议主题"
                rules={[{ required: true, message: '请输入会议主题' }]}
              >
                <Input placeholder="请输入会议主题" />
              </Form.Item>

              <Form.Item
                name="description"
                label="会议描述"
              >
                <TextArea rows={4} placeholder="请输入会议描述（可选）" />
              </Form.Item>

              <Form.Item
                name="organizerId"
                label="预约人"
                rules={[{ required: true, message: '请选择预约人' }]}
              >
                <Select placeholder="请选择预约人">
                  {members.map(member => (
                    <Select.Option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="participantIds"
                label="参会人员"
                rules={[{ required: true, message: '请选择参会人员' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择参会人员"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={members.map(m => ({
                    value: m.id,
                    label: `${m.name} (${m.email})`,
                  }))}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    提交预约
                  </Button>
                  <Button onClick={() => form.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        会议室管理系统 ©2024
      </Footer>
    </Layout>
  )
}

