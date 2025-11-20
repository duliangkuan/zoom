# 会议室管理系统

一个基于 Next.js 和 Vercel 的公司内部会议室管理系统，支持会议室预约、邮件邀请和签到功能。

## 功能特性

- ✅ **会议室预约**：8个会议室，24小时可预约，30分钟为最小单位
- ✅ **时间段冲突检测**：自动检测并防止时间段冲突
- ✅ **团队成员管理**：添加和管理团队成员信息（姓名、QQ邮箱）
- ✅ **邮件邀请**：预约后一键发送会议邀请邮件（SMTP）
- ✅ **会议签到**：查看会议列表并进行签到，自动判断是否迟到

## 技术栈

- **前端框架**：Next.js 14+ (App Router) + TypeScript
- **UI组件库**：Ant Design
- **数据库**：PostgreSQL (通过 Prisma ORM)
- **邮件服务**：nodemailer (QQ邮箱SMTP)
- **部署平台**：Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# 数据库连接（Vercel Postgres 或外部数据库）
DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_db"

# SMTP配置（QQ邮箱）
SMTP_USER="your-qq-email@qq.com"
SMTP_PASS="your-qq-email-auth-code"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库Schema（开发环境）
npm run db:push

# 或使用迁移（生产环境推荐）
npm run db:migrate
```

### 4. 初始化会议室数据

系统需要8个会议室的基础数据。你可以通过以下方式添加：

- 使用 Prisma Studio: `npm run db:studio`
- 或通过 API: `POST /api/rooms`

示例数据：
```json
[
  {"roomNumber": 1, "roomName": "会议室1", "capacity": 10},
  {"roomNumber": 2, "roomName": "会议室2", "capacity": 15},
  {"roomNumber": 3, "roomName": "会议室3", "capacity": 20},
  {"roomNumber": 4, "roomName": "会议室4", "capacity": 25},
  {"roomNumber": 5, "roomName": "会议室5", "capacity": 30},
  {"roomNumber": 6, "roomName": "会议室6", "capacity": 35},
  {"roomNumber": 7, "roomName": "会议室7", "capacity": 40},
  {"roomNumber": 8, "roomName": "会议室8", "capacity": 50}
]
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 在 Vercel 部署

1. 访问 [Vercel](https://vercel.com)
2. 导入你的 GitHub 仓库
3. 配置环境变量：
   - `DATABASE_URL`: 数据库连接字符串
   - `SMTP_USER`: QQ邮箱
   - `SMTP_PASS`: QQ邮箱授权码
4. 点击部署

### 3. 配置数据库

#### 选项A：使用 Vercel Postgres（推荐）

1. 在 Vercel 项目设置中添加 Vercel Postgres
2. 自动获取 `DATABASE_URL` 环境变量
3. 运行数据库迁移：
   ```bash
   npx prisma migrate deploy
   ```

#### 选项B：使用外部数据库

- Supabase
- PlanetScale
- 或其他 PostgreSQL 服务

### 4. 配置 QQ 邮箱 SMTP

1. 登录 QQ邮箱
2. 设置 → 账户 → 开启 SMTP 服务
3. 获取授权码
4. 在 Vercel 环境变量中配置 `SMTP_USER` 和 `SMTP_PASS`

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── rooms/          # 会议室API
│   │   ├── meetings/       # 会议API
│   │   ├── team-members/   # 团队成员API
│   │   ├── check-ins/      # 签到API
│   │   └── email/          # 邮件API
│   ├── booking/            # 预约页面
│   ├── team-members/       # 团队成员管理页面
│   ├── check-in/           # 签到页面
│   └── page.tsx            # 首页
├── components/             # 公共组件
│   └── TimeSlotPicker/     # 时间段选择器
├── lib/                    # 工具库
│   ├── prisma.ts           # Prisma客户端
│   ├── email.ts            # 邮件发送
│   └── utils.ts            # 工具函数
├── prisma/                 # Prisma配置
│   └── schema.prisma       # 数据库Schema
└── types/                  # TypeScript类型定义
```

## API 文档

### 会议室
- `GET /api/rooms` - 获取所有会议室
- `GET /api/rooms/[id]/availability` - 获取可用时间段

### 会议预约
- `GET /api/meetings` - 获取会议列表
- `POST /api/meetings` - 创建会议
- `GET /api/meetings/[id]` - 获取会议详情
- `PUT /api/meetings/[id]` - 更新会议
- `DELETE /api/meetings/[id]` - 取消会议
- `POST /api/meetings/[id]/send-invitation` - 发送邀请邮件

### 团队成员
- `GET /api/team-members` - 获取成员列表
- `POST /api/team-members` - 添加成员
- `PUT /api/team-members/[id]` - 更新成员
- `DELETE /api/team-members/[id]` - 删除成员

### 签到
- `GET /api/check-ins` - 获取签到记录
- `POST /api/check-ins` - 提交签到

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# Prisma相关
npm run db:generate    # 生成 Prisma Client
npm run db:push        # 推送Schema到数据库
npm run db:migrate     # 创建迁移
npm run db:studio      # 打开 Prisma Studio
```

## 注意事项

1. **数据库初始化**：首次部署需要运行数据库迁移
2. **SMTP配置**：确保QQ邮箱已开启SMTP服务并获取授权码
3. **时区设置**：系统默认使用中国时区（Asia/Shanghai）
4. **时间段冲突**：系统会自动检测并防止时间段冲突

## 许可证

MIT

