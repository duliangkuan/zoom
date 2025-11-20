'use client'

import { useState, useEffect } from 'react'
import { Layout, Card, List, Button, Tag, Modal, Space, Menu, Tabs, message, Select, Empty } from 'antd'
import { CalendarOutlined, TeamOutlined, CheckCircleOutlined, HomeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dayjs from 'dayjs'
import { formatDateTime, getMeetingStatus } from '@/lib/utils'

const { Header, Content, Footer } = Layout

interface Meeting {
  id: number
  title: string
  startTime: string
  endTime: string
  status: string
  room: {
    roomName: string
  }
  organizer: {
    name: string
  }
  participants: Array<{
    member: {
      id: number
      name: string
    }
  }>
  checkIns?: Array<{
    id: number
    memberId: number
    member: {
      id: number
      name: string
    }
    checkInTime: string
    status: string
  }>
}

export default function CheckInPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('today')
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  useEffect(() => {
    loadMeetings()
  }, [activeTab])

  const loadMeetings = async () => {
    setLoading(true)
    try {
      let url = '/api/meetings'
      
      if (activeTab === 'today') {
        // 今日会议：显示今天的所有已预约会议（包括已开始和即将开始的）
        url += `?date=${dayjs().format('YYYY-MM-DD')}`
      } else if (activeTab === 'upcoming') {
        // 即将开始：显示未来7天的会议
        const startDate = dayjs().format('YYYY-MM-DD')
        url += `?date=${startDate}`
      } else {
        // 全部会议：显示所有已预约的会议（不限制日期和状态）
        url += '?status=scheduled'
      }

      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        let filtered = data.data
        
        // 对于"即将开始"标签，只显示未来的会议
        if (activeTab === 'upcoming') {
          const now = new Date()
          filtered = filtered.filter((m: Meeting) => {
            const startTime = new Date(m.startTime)
            return startTime >= now && m.status === 'scheduled'
          })
        } else if (activeTab === 'today') {
          // 今日会议：显示今天的所有会议（包括已开始但未结束的）
          const now = new Date()
          filtered = filtered.filter((m: Meeting) => {
            const endTime = new Date(m.endTime)
            return endTime >= now && m.status === 'scheduled'
          })
        } else {
          // 全部会议：只显示未取消的会议
          filtered = filtered.filter((m: Meeting) => m.status !== 'cancelled')
        }
        
        // 加载每个会议的签到记录
        const meetingsWithCheckIns = await Promise.all(
          filtered.map(async (meeting: Meeting) => {
            try {
              const checkInsRes = await fetch(`/api/check-ins?meetingId=${meeting.id}`)
              const checkInsData = await checkInsRes.json()
              return {
                ...meeting,
                checkIns: checkInsData.success ? checkInsData.data : [],
              }
            } catch {
              return { ...meeting, checkIns: [] }
            }
          })
        )
        
        setMeetings(meetingsWithCheckIns)
      }
    } catch (error) {
      message.error('加载会议列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setModalVisible(true)
  }

  const handleSubmitCheckIn = async () => {
    if (!selectedMemberId || !selectedMeeting) {
      message.warning('请选择参会人员')
      return
    }

    try {
      const response = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: selectedMeeting.id,
          memberId: selectedMemberId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        message.success('签到成功！')
        setModalVisible(false)
        setSelectedMemberId(null)
        loadMeetings()
      } else {
        message.error(data.error || '签到失败')
      }
    } catch (error: any) {
      message.error('签到失败: ' + error.message)
    }
  }

  const getStatusTag = (meeting: Meeting) => {
    const status = getMeetingStatus({
      startTime: new Date(meeting.startTime),
      endTime: new Date(meeting.endTime),
      status: meeting.status,
    })

    if (status === '即将开始') return <Tag color="blue">即将开始</Tag>
    if (status === '进行中') return <Tag color="green">进行中</Tag>
    if (status === '已结束') return <Tag color="default">已结束</Tag>
    return <Tag>{status}</Tag>
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

  const tabItems = [
    {
      key: 'today',
      label: '今日会议',
    },
    {
      key: 'upcoming',
      label: '即将开始',
    },
    {
      key: 'all',
      label: '全部会议',
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
          defaultSelectedKeys={['checkin']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card title="会议签到">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
            {meetings.length === 0 && !loading ? (
              <Empty description="暂无会议" />
            ) : (
              <List
                loading={loading}
                dataSource={meetings}
                renderItem={(meeting) => {
                  // 检查哪些成员已签到
                  const checkedInMemberIds = meeting.checkIns?.map(ci => ci.memberId) || []
                  const uncheckedParticipants = meeting.participants.filter(
                    p => !checkedInMemberIds.includes(p.member.id)
                  )
                  
                  return (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleCheckIn(meeting)}
                    >
                      签到
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{meeting.title}</span>
                        {getStatusTag(meeting)}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <div>
                          <ClockCircleOutlined /> {formatDateTime(meeting.startTime)} - {formatDateTime(meeting.endTime)}
                        </div>
                        <div>
                          <CalendarOutlined /> {meeting.room.roomName}
                        </div>
                        <div>
                          <TeamOutlined /> 组织者: {meeting.organizer.name} | 参会人数: {meeting.participants.length}
                          {meeting.checkIns && meeting.checkIns.length > 0 && (
                            <span style={{ marginLeft: '12px', color: '#52c41a' }}>
                              | 已签到: {meeting.checkIns.length}人
                            </span>
                          )}
                        </div>
                        {meeting.checkIns && meeting.checkIns.length > 0 && (
                          <div style={{ marginTop: '8px', padding: '8px', background: '#f0f2f5', borderRadius: '4px' }}>
                            <strong>已签到人员：</strong>
                            {meeting.checkIns.map((checkIn, idx) => (
                              <Tag key={checkIn.id} color={checkIn.status === 'late' ? 'orange' : 'green'} style={{ marginTop: '4px' }}>
                                {checkIn.member.name} {checkIn.status === 'late' ? '(迟到)' : ''}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        会议室管理系统 ©2024
      </Footer>

      <Modal
        title="会议签到"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setSelectedMemberId(null)
        }}
        onOk={handleSubmitCheckIn}
        okText="确认签到"
      >
        {selectedMeeting && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <strong>会议主题：</strong>{selectedMeeting.title}
            </div>
            <div>
              <strong>会议时间：</strong>
              {formatDateTime(selectedMeeting.startTime)} - {formatDateTime(selectedMeeting.endTime)}
            </div>
            <div>
              <strong>会议室：</strong>{selectedMeeting.room.roomName}
            </div>
            <div>
              <strong>选择参会人员：</strong>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                value={selectedMemberId}
                onChange={setSelectedMemberId}
                placeholder="请选择参会人员"
              >
                {selectedMeeting.participants.map(p => {
                  const isCheckedIn = selectedMeeting.checkIns?.some(ci => ci.memberId === p.member.id)
                  return (
                    <Select.Option 
                      key={p.member.id} 
                      value={p.member.id}
                      disabled={isCheckedIn}
                    >
                      {p.member.name} {isCheckedIn ? '(已签到)' : ''}
                    </Select.Option>
                  )
                })}
              </Select>
              {selectedMeeting.checkIns && selectedMeeting.checkIns.length > 0 && (
                <div style={{ marginTop: '12px', padding: '8px', background: '#f0f2f5', borderRadius: '4px' }}>
                  <strong>已签到人员：</strong>
                  {selectedMeeting.checkIns.map(checkIn => (
                    <Tag key={checkIn.id} color={checkIn.status === 'late' ? 'orange' : 'green'} style={{ marginTop: '4px' }}>
                      {checkIn.member.name} {checkIn.status === 'late' ? '(迟到)' : ''}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </Space>
        )}
      </Modal>
    </Layout>
  )
}

