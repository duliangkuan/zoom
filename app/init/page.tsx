'use client'

import { useState } from 'react'
import { Layout, Card, Button, message, Result } from 'antd'
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const { Header, Content, Footer } = Layout

export default function InitPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleInit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/init-rooms', { method: 'POST' })
      const data = await res.json()
      
      if (data.success) {
        message.success('会议室初始化成功！')
        setSuccess(true)
        // 3秒后跳转到预约页面
        setTimeout(() => {
          router.push('/booking')
        }, 2000)
      } else {
        message.error(data.error || '初始化失败')
      }
    } catch (err: any) {
      message.error('初始化失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          会议室管理系统
        </div>
      </Header>
      <Content style={{ padding: '50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {success ? (
            <Result
              status="success"
              title="会议室初始化成功！"
              subTitle="系统已创建8个会议室（会议室一到会议室八），正在跳转到预约页面..."
              extra={[
                <Button type="primary" key="booking" onClick={() => router.push('/booking')}>
                  前往预约页面
                </Button>,
                <Button key="home" onClick={() => router.push('/')}>
                  返回首页
                </Button>,
              ]}
            />
          ) : (
            <Card title="初始化会议室">
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', marginBottom: '30px' }}>
                  系统需要初始化8个会议室才能正常使用预约功能
                </p>
                <p style={{ color: '#666', marginBottom: '40px' }}>
                  将创建以下会议室：
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '16px',
                  marginBottom: '40px',
                  textAlign: 'left'
                }}>
                  {['会议室一', '会议室二', '会议室三', '会议室四', 
                    '会议室五', '会议室六', '会议室七', '会议室八'].map((name, index) => (
                    <div key={index} style={{ 
                      padding: '12px', 
                      background: '#f5f5f5', 
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {name}
                    </div>
                  ))}
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  loading={loading}
                  onClick={handleInit}
                  icon={<CheckCircleOutlined />}
                >
                  {loading ? '正在初始化...' : '开始初始化'}
                </Button>
                <div style={{ marginTop: '20px' }}>
                  <Link href="/">返回首页</Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        会议室管理系统 ©2024
      </Footer>
    </Layout>
  )
}


