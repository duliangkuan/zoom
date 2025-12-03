'use client'

import { useState, useEffect } from 'react'
import { Layout, Card, Table, Button, Modal, Form, Input, message, Space, Menu } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'

const { Header, Content, Footer } = Layout

interface TeamMember {
  id: number
  name: string
  email: string
  authCode?: string
  department?: string
  position?: string
  createdAt: string
  updatedAt: string
}

export default function TeamMembersPage() {
  const [form] = Form.useForm()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/team-members')
      const data = await response.json()
      if (data.success) {
        setMembers(data.data)
      }
    } catch (error) {
      message.error('加载团队成员失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingMember(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: TeamMember) => {
    setEditingMember(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个团队成员吗？',
      onOk: async () => {
        try {
          const response = await fetch(`/api/team-members/${id}`, {
            method: 'DELETE',
          })
          const data = await response.json()
          if (data.success) {
            message.success('删除成功')
            loadMembers()
          } else {
            message.error(data.error || '删除失败')
          }
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      const url = editingMember
        ? `/api/team-members/${editingMember.id}`
        : '/api/team-members'
      const method = editingMember ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (data.success) {
        message.success(editingMember ? '更新成功' : '添加成功')
        setModalVisible(false)
        form.resetFields()
        loadMembers()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error: any) {
      message.error('操作失败: ' + error.message)
    }
  }

  const columns: ColumnsType<TeamMember> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '授权码',
      dataIndex: 'authCode',
      key: 'authCode',
      render: (text: string) => text ? '***已设置***' : '未设置',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

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
          defaultSelectedKeys={['team']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card
            title="团队成员管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加成员
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={members}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        会议室管理系统 ©2024
      </Footer>

      <Modal
        title={editingMember ? '编辑团队成员' : '添加团队成员'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="139邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入139邮箱" />
          </Form.Item>

          <Form.Item
            name="authCode"
            label="139邮箱授权码"
            rules={[
              { required: true, message: '请输入139邮箱授权码' },
            ]}
            help="用于发送会议邀请邮件，需要在139邮箱设置中生成授权码"
          >
            <Input.Password placeholder="请输入139邮箱授权码" />
          </Form.Item>

          <Form.Item
            name="department"
            label="部门"
          >
            <Input placeholder="请输入部门（可选）" />
          </Form.Item>

          <Form.Item
            name="position"
            label="职位"
          >
            <Input placeholder="请输入职位（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

