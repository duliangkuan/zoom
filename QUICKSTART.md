# 快速开始指南

## 🚀 5分钟快速启动

### 1. 安装依赖（已完成 ✅）
```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

**Windows:**
```bash
copy .env.example .env.local
```

**Mac/Linux:**
```bash
cp .env.example .env.local
```

然后编辑 `.env.local`，填入你的配置：

```env
# 数据库连接（如果还没有数据库，可以先使用SQLite测试）
DATABASE_URL="file:./dev.db"

# 或者使用PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_db"

# QQ邮箱SMTP（可选，测试时可以暂时不填）
SMTP_USER="your-qq-email@qq.com"
SMTP_PASS="your-qq-email-auth-code"
```

### 3. 初始化数据库

```bash
# 生成Prisma Client（已完成 ✅）
npm run db:generate

# 推送数据库Schema
npm run db:push
```

### 4. 初始化会议室数据

启动开发服务器后，在浏览器中访问：
```
http://localhost:3000/api/init-rooms
```

或者使用curl：
```bash
curl -X POST http://localhost:3000/api/init-rooms
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 🎉

## 📝 首次使用步骤

1. **添加团队成员** (`/team-members`)
   - 点击"添加成员"
   - 输入姓名和QQ邮箱
   - 保存

2. **预约会议** (`/booking`)
   - 选择会议室
   - 选择日期和时间段
   - 填写会议主题
   - 选择预约人和参会人员
   - 提交预约

3. **发送邀请**（可选）
   - 预约成功后选择发送邀请
   - 系统会发送邮件给所有参会人员

4. **会议签到** (`/check-in`)
   - 查看会议列表
   - 点击"签到"按钮
   - 选择参会人员并确认

## ⚠️ 注意事项

- **数据库**：首次运行需要配置数据库连接
- **邮件服务**：测试时可以暂时不配置SMTP，不影响其他功能
- **会议室初始化**：必须初始化8个会议室才能正常使用预约功能

## 🆘 遇到问题？

查看 [SETUP.md](./SETUP.md) 获取详细配置说明。

