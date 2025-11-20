# 项目初始化指南

## 第一步：配置环境变量

1. 复制 `.env.example` 文件为 `.env.local`：
   ```bash
   copy .env.example .env.local
   ```

2. 编辑 `.env.local` 文件，填入你的配置：
   ```env
   # 数据库连接
   DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_db"
   
   # QQ邮箱SMTP配置
   SMTP_USER="your-qq-email@qq.com"
   SMTP_PASS="your-qq-email-auth-code"
   ```

### 获取QQ邮箱授权码

1. 登录QQ邮箱
2. 进入 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 开启 **POP3/SMTP服务** 或 **IMAP/SMTP服务**
5. 点击 **生成授权码**，复制授权码到 `SMTP_PASS`

## 第二步：设置数据库

### 选项A：使用本地PostgreSQL

1. 安装PostgreSQL（如果还没有）
2. 创建数据库：
   ```sql
   CREATE DATABASE meeting_room_db;
   ```
3. 更新 `.env.local` 中的 `DATABASE_URL`

### 选项B：使用Vercel Postgres（推荐用于生产环境）

1. 在Vercel项目设置中添加Vercel Postgres
2. 自动获取 `DATABASE_URL` 环境变量

### 选项C：使用Supabase（免费）

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 在项目设置中获取数据库连接字符串
4. 更新 `.env.local` 中的 `DATABASE_URL`

## 第三步：初始化数据库

```bash
# 推送数据库Schema到数据库
npm run db:push
```

或者使用迁移（推荐生产环境）：
```bash
npm run db:migrate
```

## 第四步：初始化会议室数据

系统需要8个会议室的基础数据。你可以通过以下方式添加：

### 方法1：使用API（推荐）

启动开发服务器后，访问：
```
POST http://localhost:3000/api/init-rooms
```

或者使用curl：
```bash
curl -X POST http://localhost:3000/api/init-rooms
```

### 方法2：使用Prisma Studio

```bash
npm run db:studio
```

在浏览器中打开 Prisma Studio，手动添加8个会议室。

### 方法3：直接使用数据库客户端

执行以下SQL（PostgreSQL）：
```sql
INSERT INTO meeting_rooms (room_number, room_name, capacity, status) VALUES
(1, '会议室1', 10, 'available'),
(2, '会议室2', 15, 'available'),
(3, '会议室3', 20, 'available'),
(4, '会议室4', 25, 'available'),
(5, '会议室5', 30, 'available'),
(6, '会议室6', 35, 'available'),
(7, '会议室7', 40, 'available'),
(8, '会议室8', 50, 'available');
```

## 第五步：启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 快速测试流程

1. **添加团队成员**
   - 访问 `/team-members`
   - 点击"添加成员"
   - 输入姓名和QQ邮箱

2. **预约会议**
   - 访问 `/booking`
   - 选择会议室、日期和时间段
   - 填写会议信息
   - 选择参会人员
   - 提交预约

3. **发送邀请**
   - 预约成功后，选择发送邀请
   - 系统会自动发送邮件给所有参会人员

4. **会议签到**
   - 访问 `/check-in`
   - 查看会议列表
   - 点击"签到"按钮
   - 选择参会人员并确认签到

## 常见问题

### 1. 数据库连接失败

- 检查 `DATABASE_URL` 是否正确
- 确认数据库服务正在运行
- 检查防火墙设置

### 2. 邮件发送失败

- 确认QQ邮箱已开启SMTP服务
- 检查授权码是否正确
- 确认 `SMTP_USER` 和 `SMTP_PASS` 环境变量已设置

### 3. Prisma Client未生成

运行：
```bash
npm run db:generate
```

### 4. 时间段选择器不显示

- 确认已初始化会议室数据
- 检查浏览器控制台是否有错误
- 确认API路由正常工作

## 部署到Vercel

1. 推送代码到GitHub
2. 在Vercel导入项目
3. 配置环境变量（在Vercel Dashboard）
4. 连接数据库（Vercel Postgres或外部数据库）
5. 部署

部署后，记得运行数据库迁移：
```bash
npx prisma migrate deploy
```

