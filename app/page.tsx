'use client'

import { Layout, Menu, Card, Row, Col, Statistic } from 'antd'
import { CalendarOutlined, TeamOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const { Header, Content, Footer } = Layout

export default function Home() {
  const [stats, setStats] = useState({
    todayMeetings: 0,
    totalMembers: 0,
    todayCheckIns: 0,
  })

  useEffect(() => {
    // 获取今日会议数
    fetch(`/api/meetings?date=${dayjs().format('YYYY-MM-DD')}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({ ...prev, todayMeetings: data.data.length }))
        }
      })

    // 获取团队成员数
    fetch('/api/team-members')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({ ...prev, totalMembers: data.data.length }))
        }
      })
  }, [])

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
          defaultSelectedKeys={['home']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
            欢迎使用会议室管理系统
          </h1>
          <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="今日会议"
                  value={stats.todayMeetings}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="团队成员"
                  value={stats.totalMembers}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="今日签到"
                  value={stats.todayCheckIns}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="会议预约"
                hoverable
                style={{ height: '200px', cursor: 'pointer' }}
                onClick={() => window.location.href = '/booking'}
              >
                <p>预约会议室，选择时间段，邀请参会人员</p>
                <CalendarOutlined style={{ fontSize: '48px', color: '#1890ff', marginTop: '20px' }} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="团队成员管理"
                hoverable
                style={{ height: '200px', cursor: 'pointer' }}
                onClick={() => window.location.href = '/team-members'}
              >
                <p>添加和管理团队成员信息</p>
                <TeamOutlined style={{ fontSize: '48px', color: '#52c41a', marginTop: '20px' }} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="会议签到"
                hoverable
                style={{ height: '200px', cursor: 'pointer' }}
                onClick={() => window.location.href = '/check-in'}
              >
                <p>查看会议列表并进行签到</p>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginTop: '20px' }} />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        会议室管理系统 ©2024
      </Footer>
    </Layout>
  )
}

